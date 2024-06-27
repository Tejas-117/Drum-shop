import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // fetch all the items from the inventory
    console.log(req.cookies);

    return NextResponse.json({
      message: 'Successfully retrieved items from inventory',
    });
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}