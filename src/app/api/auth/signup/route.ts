import { NextRequest, NextResponse } from 'next/server';
import { getSignUpValidationSchema } from '@/validation/user';
import redisClient from '@/lib/redisClient';
import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';

export async function POST(req: NextRequest) {  
  const UserValidationSchema = getSignUpValidationSchema();

  try {
    // get the email from the req body
    const reqBody = await req.json();
    const email: string = reqBody.email;

    // validate the data recieved
    const validationRes = UserValidationSchema.safeParse(reqBody);
    
    if (validationRes.success === false) {
      let errorMessage = '';
      const errorObj: { [key:string]: string } = {};

      validationRes.error.errors.forEach((error) => {
        errorMessage += `${error.message}\n`;
        errorObj[error.path[0]] = error.message;
      });

      return NextResponse.json(
        { 
          message: errorMessage,
          error: errorObj,
        }, 
        { status: 400 }
      );
    }

    // check if the user is already registered
    const existingUser = await User.findOne({
      $or: [
        { phone: email }, 
        { email: email }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' }, 
        { status: 409 }
      );
    }

    // check if the user has verified their email
    const isUserVerified = await redisClient.get(`${email}_verified`);
    
    if (!isUserVerified || isUserVerified === 'false') {
      return NextResponse.json(
        { message: 'Please verify email' },
        { status: 200 },
      );  
    }

    // save the user to the database
    await dbConnect();
    const user = new User(validationRes.data).save();

    return NextResponse.json(
      { 
        message: 'Signup successful',
        user: user,
      },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}