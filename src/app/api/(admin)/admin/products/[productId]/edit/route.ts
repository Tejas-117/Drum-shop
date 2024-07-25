import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest, 
  { params }: { params: { productId: string }}
) {
  try {
    const { productId } = params;
    
    // if the productId is invalid return error
    if ((!productId) || (mongoose.isValidObjectId(productId))) {
      return NextResponse.json(
        { message: 'Invalid product id' },
        { status: 400 }
      );
    }

    await dbConnect();

    await Product.findByIdAndDelete(productId);

    return NextResponse.json(
      { message: 'Successfully retrieved items from inventory' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}