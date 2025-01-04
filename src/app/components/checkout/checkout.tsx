'use client';

import { Address } from '@/types/address';
import styles from './checkout.module.css';
import { CartProductWithPrice, CartType } from '@/types/cart';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CheckoutProduct from './checkoutProduct/checkoutProduct';
import CheckoutPrice from './checkoutPrice/checkoutPrice';

type PropsType = {
  cart: CartType | null,
  address: Address[]
}

function CheckoutPage(props: PropsType) {
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [cart, setCart] = useState<CartType | null>(null);

  // state to maintain selected address
  const [selectedAddressId, setSelectedAddressId] = useState('');

  useEffect(() => {
    setCart(props.cart);
    setAddresses(props.address);

    if (props.address.length > 0) {
      setSelectedAddressId(props.address[0]._id);
    }
  }, [setCart, setAddresses, props]);

  return (
    <div className={styles.checkout_outer_container}>
      <div className={styles.left_grid}>
        
        {/* Address container */}
        <div className={styles.address_container}>
          <h2>DELIVERY ADDRESS</h2>

          {addresses.map((address, idx) => {
            return (
              <div className={styles.address} key={idx}>
                <input 
                  type='radio'
                  checked={(address._id === selectedAddressId)}
                  onChange={() => setSelectedAddressId(address._id)}
                />

                <div>
                  <div className={styles.first_line}>
                    <span className={styles.name}>{address.name} </span>
                    <span className={styles.phone}>{address.phone}</span>
                    <span className={styles.address_type}>{address.addressType.toUpperCase()}</span>
                  </div>

                  <p>{address.address}</p>
                  <div>
                    <span>{address.city + ', '}</span>
                    <span>{address.state + ', '}</span>
                    <span>{address.pinCode}</span>
                  </div>
                </div>
              </div>
            )
          })}

          <Link
            className={styles.address_actions}
            href={'/profile?type=address'}
          >
            Manage Addresses
          </Link>
        </div>

        {/* Order summary container */}
        <div className={styles.order_summary_container}>
          <h2>ORDER SUMMARY</h2>

          {cart?.products.map((product, idx) => {
            return (
              <CheckoutProduct 
                product={product} 
                key={idx} 
              />
            );
          })}
        </div>
      </div> 

      {/* checkout price container */}
      <div className={styles.right_grid}>
        <CheckoutPrice cart={cart} />
      </div>
    </div>
  )
}

export default CheckoutPage;
