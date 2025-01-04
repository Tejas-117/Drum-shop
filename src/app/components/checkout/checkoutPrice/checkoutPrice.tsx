'use client';

import { useEffect, useState } from 'react';
import styles from './checkoutPrice.module.css';
import { useRouter } from 'next/navigation';
import { BeatLoader } from 'react-spinners';
import { CartType } from '@/types/cart';

type QuantityErrorType = { 
  cartProductId: string,
  productId: string,
  variant?: string,
  name: string, 
  cartQuantity: number, 
  availableQuantity: number
};

function CheckoutPrice({ cart }: { cart: CartType | null }) {
  const router = useRouter();

  // different sub-total price of the cart
  const [productPrice, setProductPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(0);

  // cart total
  const [total, setTotal] = useState(0);

  // state to depict loading state of the component
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

  // state to display the errors thrown by syncing cart with server
  const [displayError, setDisplayError] = useState(false);
  const [syncErrors, setSyncErrors] = useState<QuantityErrorType[]>([]);

  useEffect(() => {
    // function to calculate total price of the cart
    function calculateTotal() {
      if (!cart) return;

      let tempProductPrice = 0, tempDiscount = 0, tempShipping = 0;

      cart.products.map((cartProduct) => {
        const product = cartProduct.productId;
        let productPrice = product.sellingPrice;
        const quantity = cartProduct.quantity;

        if (cartProduct.groupId) {
          const matchingGrp = product.groups.find((grp) => grp._id === cartProduct.groupId);
          if (matchingGrp) {
            productPrice = matchingGrp.price;
          }
        }

        let price = productPrice * quantity
        const discountAmt = product.discount * quantity;
        
        tempProductPrice += price;
        tempDiscount += discountAmt;
      });

      setProductPrice(tempProductPrice);
      setDiscount(tempDiscount);
      setTotal(tempProductPrice - tempDiscount + tempShipping);
    }

    calculateTotal();
  }, [cart]);


  return (
    <div className={styles.checkout_price_container}>
      <h2>PRICE DETAILS</h2>

      <div className={styles.entry_container}>
        <div className={styles.entry}>
          <span>Price ({cart?.products.length} Items)</span>
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

      <button 
        className={styles.checkout_btn}
        onClick={() => console.log('Clicked...')}
      >
        {(isLoading) ?
          <BeatLoader /> :
          'Proceed to payment'
        }
      </button>
    </div>
  );
}

export default CheckoutPrice;
