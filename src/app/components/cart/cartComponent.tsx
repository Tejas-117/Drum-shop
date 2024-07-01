'use client';

import { FaLongArrowAltRight } from 'react-icons/fa';
import styles from './cart.module.css';
import CartProduct from '../cartProduct/cartProduct';

import { type CartType } from '@/types/cart';
import { CartContext, CartContextProvider } from '@/app/context/cart/provider';
import { initialState, reducer } from '@/app/context/cart/reducer';
import { useContext, useEffect } from 'react';

function CartComponent({ cartProp }: { cartProp: (CartType | null) }) {
  const {state, dispatch} = useContext(CartContext);

  useEffect(() => {
    // add products to the context
    
  });

  return (
    <div className={styles.outer_container}>
      <p className={styles.top_heading}>
        Want to call the store to place an order? Call us now
        <FaLongArrowAltRight className={styles.arrow_icon} />
      </p>

      <h1>YOUR CART</h1>

      {/* container containing all the cart info */}
      <CartContextProvider initialState={initialState} reducer={reducer}>
        <div className={styles.cart_container}>
          
          {/* container containing product info in cart */}
          <div className={styles.left_container}>
            {cartProp?.products.map((cartProduct, idx) => {
              return (
                <CartProduct 
                  cartProduct={cartProduct} 
                  key={idx} 
                />
              );
            })}
          </div>

          {/* container containing price details */}
          <div className={styles.right_container}></div>
        </div>
      </CartContextProvider>

    </div>
  );
}

export default CartComponent