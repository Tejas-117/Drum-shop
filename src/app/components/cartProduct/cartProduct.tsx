import { useContext, useState } from 'react';
import styles from './cartProduct.module.css';
import { type CartProduct } from '@/types/cart';
import { CartContext } from '@/app/context/cart/provider';

function CartProduct({ cartProduct }: { cartProduct: CartProduct}) {
  const {state, dispatch} = useContext(CartContext);

  const [product, setProduct] = useState(cartProduct.productId);

  function increaseQuantity() {
    console.log('Function called');
    console.log(state);
  }

  function decreaseQuantity() {

  }

  return (
    <div className={styles.cart_product}>
      <div>
        <img
          src={product.images[0]}
          alt={`${product.name} image`} 
        />
      </div>

      <div>
        <h3>{product.name}</h3>
        <p>{product.category
              .split(' ')
              .map((word: string) => {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              })
              .join(' ')}
        </p>

        <div>
          <button onClick={() => decreaseQuantity()}>-</button>
          {cartProduct.quantity}
          <button onClick={() => increaseQuantity()}>+</button>
        </div>
      </div>
    </div>
  )
}

export default CartProduct;
