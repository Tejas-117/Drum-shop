import { verifyToken } from '@/helpers/jwt';
import dbConnect from '@/lib/dbConnect';
import Cart from '@/models/cart';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // retrieve the token stored in the cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    // if the token is not present, user is not authenticated
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthenticated' },
        { status: 401 }
      )
    }
    
    // verify the user and return the info
    const decodedToken = verifyToken(token);

    // get the userId and add the cartId to cookie
    await dbConnect();
    const userId = decodedToken.userId;

    const cart = await Cart.findOne({userId});

    return NextResponse.json(
      { 
        message: 'Authenticated',
        user: {
          userId: decodedToken.userId,
          email: decodedToken.email,
        },
        cart: {
          cartId: cart._id,
          productCount: cart.products.length,
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