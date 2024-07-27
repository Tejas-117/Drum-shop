import { ProductType } from '@/types/product';
import styles from './product.module.css';
import { GrView } from 'react-icons/gr';
import { RiEditFill } from 'react-icons/ri';
import { MdDeleteForever } from 'react-icons/md';
import { forwardRef } from 'react';
import Link from 'next/link';

interface AdminProductProps {
  product: ProductType,
}

const Product = forwardRef<HTMLTableRowElement, AdminProductProps>(({ product }, ref) =>  {  
  function getPrice(product: ProductType) {
    if (product.sellingPrice) return product.sellingPrice;
    return product.groups[0].price;
  }

  function getQuantity(product: ProductType) {
    if (product.quantity) return product.quantity;
    return product.groups[0]?.quantity || '-';
  }

  return (
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
        <MdDeleteForever />
      </td>
    </tr>
  )
});

Product.displayName = 'AdminProduct';

export default Product;
