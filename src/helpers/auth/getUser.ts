/*
  File: getUser.ts
  Description: this file contains function to retrieve a authenticated
  user's info using server-side fetch
*/

import { cache } from 'react';
import { cookies } from 'next/headers';

type UserType = {
  userId: string,
  email: string,
}

async function getAuthenticatedUser(): Promise<UserType | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me`, {
      cache: 'no-store',
      headers: { 
        // cookie should be added while using server-side fetch
        Cookie: cookies().toString()
      },
    });
    const data = await res.json();

    if (data.user) {
      return data.user;
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

const getUser = cache(getAuthenticatedUser);

export {
  getAuthenticatedUser,
  getUser,
  type UserType,
}
