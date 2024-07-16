/*
  Description: contains a single route that takes email
  and adds a otp to that email in redis
*/

import generateOTP from '@/helpers/generateOTP';
import { NextRequest, NextResponse } from 'next/server';
import redisClient from '@/lib/redisClient';

export async function POST(req: NextRequest) {
  try {
    // get the email from the req body
    const reqBody = await req.json();
    const email: string = reqBody.email;
    
    // if email is absent, return error
    if (!email) {
      return NextResponse.json(
        { message: 'Missing parameter: email' }, 
        { status: 400 }
      );
    }

    // generate an otp
    const otp = generateOTP();
  
    // set this otp in redis database for a min
    await redisClient.set(email, otp, {ex: 180});
  
    return NextResponse.json(
      { message: 'OTP generated successfully' },
      { status: 200 },
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    );
  }
}