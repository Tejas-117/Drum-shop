import dbConnect from '@/lib/dbConnect';
import User from '@/models/user';
import { getSignUpValidationSchema } from '@/validation/user';
import { NextRequest, NextResponse } from 'next/server';

// TODO: this route should only be accessed by admin with privilege 'chief'

export async function GET() {
  try {
    await dbConnect();

    // fetch all the admin users
    const adminUsers = await User.find({isAdmin: true});

    return NextResponse.json(
      {
        message: 'Successfully retrieved admins',
        users: adminUsers,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const UserValidationSchema = getSignUpValidationSchema(true);

  try {
    const reqBody = await req.json();

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
    
    await dbConnect();

    // check if the admin user is already registered
    const existingUser = await User.findOne({
      $or: [
        { phone: reqBody.phone }, 
        { email: reqBody.email }
      ]
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Admin user already exists' }, 
        { status: 409 }
      );
    }

    const admin = new User(validationRes.data);
    await admin.save();

    return NextResponse.json(
      { 
        message: 'Successfully added admin',
        admin,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}