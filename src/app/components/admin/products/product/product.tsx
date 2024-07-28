import { ProductType } from '@/types/product';
import styles from './product.module.css';
import { GrView } from 'react-icons/gr';
import { RiEditFill } from 'react-icons/ri';
import { MdDeleteForever } from 'react-icons/md';
import { forwardRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import axios from 'axios';

interface AdminProductProps {
  product: ProductType,
}

const Product = forwardRef<HTMLTableRowElement, AdminProductProps>(({ product }, ref) =>  {  

  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  function getPrice(product: ProductType) {
    if (product.sellingPrice) return product.sellingPrice;
    return product.groups[0].price;
  }

  function getQuantity(product: ProductType) {
    if (product.quantity) return product.quantity;
    return product.groups[0]?.quantity || '-';
  }

  // function to delete the product
  async function deleteProduct() {
    setIsLoading(false);

    try {
      const res = await axios.delete(`/api/admin/products/${product._id}/delete`);
      const { message } = res.data;
      toast.success(message);
      setShowDeletePopup(false);
    } catch (error: any) {
      const errorData = error.response.data;
      const errorMessage = errorData.message;
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>  
    {/* pop up to verify the download action */}
     {(showDeletePopup) && (
      <div className={styles.delete_popup_container}>
        <div className={styles.delete_popup}>
          <p>
            Do you want to delete this product? This action is irreversible.
            <h4>{product.name}</h4>
          </p>

          <div className={styles.delete_popup_actions}>
            <button onClick={() => deleteProduct()}>Delete</button>
            <button onClick={() => setShowDeletePopup(false)}>Cancel</button>
          </div>
        </div>
      </div>
    )}

      <tr ref={ref}>
        <td>
          <img
            src={product.images[0]} 
            alt={`${product.name} image`} 
          />
        </td>
        <td>{product.name}</td>
        <td>{product.category}</td>
        <td>₹ {getPrice(product).toLocaleString('en-In')}</td>
        <td>{getQuantity(product).toLocaleString('en-In')}</td>
        <td className={styles.actions_cell}>
          <Link href={`/products/${product._id}`} target='blank'>
            <GrView />
          </Link>
          <Link href={`/admin/products/${product._id}/edit`} target='blank'>
            <RiEditFill />
          </Link>

          <MdDeleteForever onClick={(e) => setShowDeletePopup(true)} />
        </td>
      </tr>
    </>
  )
});

Product.displayName = 'AdminProduct';

export default Product;
