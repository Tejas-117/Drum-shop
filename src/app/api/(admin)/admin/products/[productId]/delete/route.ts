import mongoose from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(
  req: NextRequest, 
  { params }: { params: { productId: string }}
) {
  try {
    const { productId } = params;

    // if the productId is invalid return error
    if ((!productId) || (!mongoose.isValidObjectId(productId))) {
      return NextResponse.json(
        { message: 'Invalid product id' },
        { status: 400 }
      );
    }

    await dbConnect();

    const product = await Product.findById(productId);

    // delete the images
    product.images.forEach((img) => {
      // delete each image
    });

    await Product.findByIdAndDelete(productId);

    // revalidate the cache of the productId and the store
    revalidatePath('/store');
    revalidatePath(`/products/${productId}`);

    return NextResponse.json(
      { message: 'Successfully deleted product' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}