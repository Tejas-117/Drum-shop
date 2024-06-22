import { verifyToken } from '@/helpers/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // retrieve the token stored in the cookies
    const token = req.cookies.get('token')?.value;

    // if the token is not present, user is not authenticated
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthenticated' },
        { status: 401 }
      )
    }
    
    // verify the user and return the info
    const decodedToken = verifyToken(token);

    return NextResponse.json(
      { 
        message: 'Authenticated',
        user: {
          userId: decodedToken.userId,
          email: decodedToken.email,
        }
      }, 
      { status: 200 }
    );
  } catch (error: any) {
    // if the error is because of the jwtoken expiry, the user is unauthenticated
    if (error && error?.name) {
      if (error.name === 'TokenExpiredError') {
        return NextResponse.json(
          { message: 'Unauthenticated' },
          { status: 401 }
        )
      }
    }

    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}