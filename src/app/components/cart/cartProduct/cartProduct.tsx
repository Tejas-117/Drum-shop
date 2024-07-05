import { useContext, useEffect, useState } from 'react';
import { IoMdAdd, IoMdRemove } from 'react-icons/io';
import { RiDeleteBin6Line } from 'react-icons/ri';
import styles from './cartProduct.module.css';
import { CartContext } from '@/app/context/cart/provider';
import { type CartProductWithPrice } from '@/types/cart';
import { type GroupsType } from '@/types/product';
import toast from 'react-hot-toast';

function CartProduct({ cartProductId }: { cartProductId: string}) {
  const {state, dispatch} = useContext(CartContext);

  // state to hold the prop
  const [cartProduct, setCartProduct] = useState<CartProductWithPrice | null>(null);

  // state to hold the group info of the selected product
  const [group, setGroup] = useState<(GroupsType | null)>(null);

  // total price of this particular product
  const [total, setTotal] = useState(0);

  // max quantity of the product present in the db
  const [maxQuantity, setMaxQuantity] = useState(0);

  // function to increase quantity of the product in cart
  function increaseQuantity() {    
    if (cartProduct.quantity === maxQuantity) {
      toast.error('Max quantity available');
      return;
    }

    setCartProduct((prevState) => {
      return {
        ...prevState,
        quantity: prevState.quantity + 1,
      }
    });
    dispatch({
      type: 'increase_quantity',
      payload: cartProduct,
    });

    setTotal((prevTotal) => prevTotal + getPrice());
  }

  // function to decrease quantity of the product in cart
  function decreaseQuantity() {
    if (cartProduct.quantity === 1) return;

    setCartProduct((prevState) => {
      return {
        ...prevState,
        quantity: prevState.quantity - 1,
      }
    });
    dispatch({
      type: 'decrease_quantity',
      payload: cartProduct,
    });

    setTotal((prevTotal) => prevTotal - getPrice());
  }

  // function to remove product from the cart
  function removeProductFromCart() {
    dispatch({
      type: 'remove_from_cart',
      payload: cartProduct,
    });

    toast.success('Removed an item from the product');
  }

  // function to get the price of the product (not to calculate total)
  function getPrice() {
    if (group !== null) {
      return group.price;
    } else {
      return cartProduct.productId.sellingPrice;
    }
  }

  useEffect(() => {
    // get the product using the id
    const temp = state.products.find((cartProduct) => cartProduct._id === cartProductId);

    if (!temp) return;

    // calculate the price of the product
    const tempProduct = temp.productId;
    let matchingGroup = tempProduct.groups.find((group) => (group._id === temp.groupId)) || null;;

    // calculate the total for this product
    const total = temp.quantity * temp.price!;

    setCartProduct(temp);
    setGroup(matchingGroup);
    setTotal(total);
    setMaxQuantity(matchingGroup?.quantity || temp.quantity);
  }, [state.products, cartProductId]);

  return (
    <div className={styles.cart_product}>
      <div>
        <img
          src={cartProduct?.productId.images[0]}
          alt={`${cartProduct?.productId.name} image`} 
        />
      </div>

      {/* TODO: when the cart product is possibly null, display a loader or error message */}

      <div className={styles.product_info}>
        <h3 className={styles.product_name}>{cartProduct?.productId.name}</h3>
        <p className={styles.product_category}>{cartProduct?.productId.category
              .split(' ')
              .map((word: string) => {
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
              })
              .join(' ')}
        </p>

        <div className={styles.quantity_btns}>
          <button 
            className={`${styles.decrease_btn} ${(cartProduct?.quantity === 1) ? styles.disable_btn : ''}`} 
            onClick={() => decreaseQuantity()}
          >
            <IoMdRemove />
          </button>
          <span>{cartProduct?.quantity}</span>
          <button
            className={`${styles.increase_btn} ${(cartProduct?.quantity === maxQuantity) ? styles.disable_btn : ''}`}
            onClick={() => increaseQuantity()}
          >
            <IoMdAdd />
          </button>
        </div>

        <div className={styles.price_container}>
          <button onClick={() => removeProductFromCart()}>
            Remove from cart
            <RiDeleteBin6Line />
          </button>
          <p>₹ {total.toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
}

export default CartProduct;
