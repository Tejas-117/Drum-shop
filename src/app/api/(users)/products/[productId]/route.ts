import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';

export async function GET(req: NextRequest) {
  console.log();

  try {
    // fetch the correct product from the db


    return NextResponse.json({
      message: 'Successfully retrieved product from db',
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}