'use client';

import { useContext, useEffect, useState } from 'react';
import styles from './cartPrice.module.css';
import { CartContext } from '@/app/context/cart/provider';

function CartPrice() {
  const {state, dispatch} = useContext(CartContext);

  const [productPrice, setProductPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  const [total, setTotal] = useState(0);

  useEffect(() => {
    // function to calculate total price of the cart
    function calculateTotal() {
      let tempProductPrice = 0, tempDiscount = 0, tempShipping = 0;

      // calculate total price and remove discount
      state.products.map((product) => {
        const productPrice = product.price!;
        const quantity = product.quantity;

        let price = productPrice * quantity
        const discountAmt = product.productId.discount * quantity;
        
        tempProductPrice += price;
        tempDiscount += discountAmt;
      });

      setProductPrice(tempProductPrice);
      setDiscount(tempDiscount);

      setTotal(tempProductPrice - tempDiscount + tempShipping);
    }

    calculateTotal();
  }, [state]);

  /* this function is to proceed to next step (checkout)
     before that, we have to sync the cart data with the server and db
  */
  function proceedToCheckout() {

  }

  return (
    <div className={styles.cart_price_container}>
      <h2>PRICE DETAILS</h2>

      <div className={styles.entry_container}>
        <div className={styles.entry}>
          <span>Price ({state.products.length} Items)</span>
          <span className={styles.entry_val}>₹ {productPrice.toLocaleString('en-IN')}</span>
        </div>

        <div className={styles.entry}>
          <span>Discount</span>
          {(discount > 0) ?
            <span className={`${styles.entry_val} ${styles.green_font}`}>-₹ {discount.toLocaleString('en-IN')}</span>:
            <span className={styles.entry_val}>₹ 0</span>
          }
        </div>

        <div className={styles.entry}>
          <span>Delivery Charges</span>
          {(shipping > 0) ?
            <span className={styles.entry_val}>+₹ {discount.toLocaleString('en-IN')}</span>:
            <span className={`${styles.entry_val} ${styles.green_font}`}>Free</span>
          }
        </div>
      </div>

      <div className={styles.total_price_container}>
        <span>Total Amount</span>
        <span>₹ {total.toLocaleString('en-IN')}</span>
      </div>

      <button className={styles.checkout_btn}>Proceed to checkout</button>
    </div>
  );
}

export default CartPrice;
