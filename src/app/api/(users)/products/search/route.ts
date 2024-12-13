import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/models/product';

export async function GET(
  req: NextRequest,
) {
  // get the searchQuery to search a product
  const searchParams = req.nextUrl.searchParams;
  const searchQuery = searchParams.get('query');

  if (!searchQuery || searchQuery.length == 0) {
    return NextResponse.json(
      { message: 'Invalid search query.' },
      { status: 400 },
    );
  }

  try {
    await dbConnect();
    
    // fetch the matching products from db
    const products = await Product.find({ $text: { $search: searchQuery } })
      .sort({ score: { $meta: 'textScore' } }) // Sorts by relevance
      .select('-costPrice')
      .exec();
    
    // TODO: implement pagination

    return NextResponse.json(
      {
        message: 'Successfully retrieved product from db',
        products,
        searchQuery,
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}