'use server';

import Cart from '@/models/cart';
import dbConnect from '@/lib/dbConnect';
import { cookies } from 'next/headers';
import { verifyToken } from '@/helpers/jwt';

type CartProductType = {
  productId: string,
  groupId: string | null,
  quantity: number,
};

type CartType = {
  _id: string,
  userId: string,
  products: CartProductType[],
}

// function to add a product to the cart
async function addProduct(cartProduct: CartProductType) {
  const cookieStore = cookies();
  
  try {
    const userTokenCookie = cookieStore.get('token') || null;
    
    // if the auth token is not present return error.
    if (userTokenCookie === null) {
      throw new Error('User not authenticated');
    }

    const userAuthToken = userTokenCookie.value;
    const user = verifyToken(userAuthToken);

    await dbConnect();

    // find the existing cart in the db of the given user
    const userCart: (CartType | null) = await Cart.findOne({userId: user.userId});

    let cartId = '';

    // if the user does not have any cart, create new one
    if (!userCart) {
      const newUserCart = new Cart({
        userId: user.userId,
        products: [{
          productId: cartProduct.productId,
          groupId: cartProduct.groupId,
          quantity: cartProduct.quantity
        }]
      });

      cartId = newUserCart._id;
      await newUserCart.save();
    } else {
      // if cart already exists, add/update product to it
      cartId = userCart._id;

      // if the product exists in the cart, update it
      const productIndex = userCart.products.findIndex((product) => {
        // if their product ids match
        if ((product.productId.toString()) === (cartProduct.productId)) { 
          // check if the groups ids match too
          if ((product.groupId) && (cartProduct.groupId)) {
            return (product.groupId === cartProduct.groupId);
          } else {
            return true;
          }
        }
      });

      if (productIndex === -1) {
        // product does not exist in the cart, add it
        await Cart.updateOne(
          { userId: user.userId },
          { $push: { products: cartProduct } }
        );
      } else {
        // product exists, update it
        await Cart.updateOne(
          { userId: user.userId },
          { $inc: { 'products.$.quantity': cartProduct.quantity } }
        );
      }
    }

    // save the cart id to a cookie and send it to user
    cookies().set('cartId', cartId);
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    }
  }
}

// function to remove an item from cart
async function removeProduct(cartProductId: string) {
  const cookieStore = cookies();

  try {
    const userTokenCookie = cookieStore.get('token') || null;
    
    // if the auth token is not present return error.
    if (userTokenCookie === null) {
      throw new Error('User not authenticated');
    }

    const userAuthToken = userTokenCookie.value;
    const user = verifyToken(userAuthToken);

    await dbConnect();

    // find the existing cart in the db of the given user
    const result = await Cart.updateOne(
      { userId: user.userId },
      { $pull: { products: { _id: cartProductId } } }
    );
  } catch (error: any) {
    return {
      error: true,
      message: error.message,
    }
  }
}

export {
  addProduct,
  removeProduct,
  type CartProductType,
  type CartType,
};
