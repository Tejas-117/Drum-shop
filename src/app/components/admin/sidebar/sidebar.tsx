/**
 * File: sidebar.tsx
 * Description: This file contains admin panel's sidebar component
*/

import styles from './sidebar.module.css';
import Link from 'next/link'

function Sidebar() {
  return (
    <div className={styles.sidebar_container}>
      <ul>
        <li><Link href="/admin/products">View all products</Link></li>
        <li><Link href="/admin/products/add">Add product</Link></li>
        <li><Link href="/admin/products">Home</Link></li>
      </ul>
    </div>
  );
}

export default Sidebar;
