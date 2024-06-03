import jwt from 'jsonwebtoken';
import crypto from 'crypto';

type JWTPayload = {
  jwtId: string, // unique id for each token
  userId: string, // user id
  email: string, // user email
  exp: number // jwt expiration time (timestamp)
}

const secretKey = process.env.JWT_SECRET!;

// function to sign data into a JWT token
export function signToken(user: {email: string, _id: string}) {
  const payload: JWTPayload = {
    jwtId: crypto.randomUUID(),
    userId: user._id,
    email: user.email,
    exp: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60), // expiry of 7days
  }

  return new Promise((resolve, reject) => {
    jwt.sign(payload, secretKey, (err, token) => {
      if (err) reject(new Error('Internal server error'));
      resolve(token);
    });
  });
}

// function to verify a JWT token and get the decoded data
export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, secretKey) as JWTPayload;
    return decoded;
  } catch (error) {
    throw error;
  }
}

/* function to check if the token is still valid, and if it is valid,
  get the time till expiration */
export function getTokenValidity(token: string) {
  return new Promise((resolve, reject) => {
    jwt.verify(
        token,
        secretKey,
        (err, data) => {
          if (err) {
            resolve({expired: true});
          } else {
            /* if no error is thrown the token is valid.
               return the time till which the token is valid */
            const jwtData = data as JWTPayload;
            const tokenExpirationTime = jwtData.exp;
            const currTime = Math.floor(Date.now() / 1000);

            // time till which the token will be valid (in seconds)
            const validTime = tokenExpirationTime - currTime;
            resolve({
              ...jwtData,
              validTime: validTime,
              expired: false
            });
          }
        },
    );
  });
}
