/**
 * File: sidebar.tsx
 * Description: This file contains admin panel's sidebar component
*/

'use client';

import { MouseEvent } from 'react';
import styles from './sidebar.module.css';
import Link from 'next/link';
import { IoIosArrowDown, IoMdAdd } from 'react-icons/io';
import { BiHomeAlt2 } from "react-icons/bi";
import { AiOutlineProduct } from "react-icons/ai";
import { GrFormView } from "react-icons/gr";
import { RiCalendarEventLine } from "react-icons/ri";

function Sidebar() {
  function toggleSubMenu(e: MouseEvent) {
    const targetEle = e.target as HTMLElement;
    const sideBarEntry = targetEle.closest(`.${styles.sidebar_entry}`);
    sideBarEntry?.classList.toggle(`${styles.active}`);
  }

  return (
    <div className={styles.sidebar_container}>
      <div className={styles.sidebar_entry}>
        <Link href={'/'}>
          <BiHomeAlt2 />
          Home
        </Link>
      </div>

      <div 
        className={`${styles.sidebar_entry} ${styles.cursor_pointer}`}
        onClick={(e) => toggleSubMenu(e)}
      >
        <p>
          <span>
            <AiOutlineProduct />
            Products
          </span>
          <IoIosArrowDown className={styles.arrow_icon} />
        </p>

        <div className={styles.sub_menu}>
          <ul>
            <li>
              <Link href="/admin/products">
                <GrFormView />
                View all products
              </Link>
            </li>
            <li>
              <Link href="/admin/products/add">
                <IoMdAdd />
                Add product
              </Link>
            </li>
          </ul>
        </div>
      </div>
      
      <div className={styles.sidebar_entry}>
        <Link href="/admin/events">
          <RiCalendarEventLine />
          Events
        </Link>
      </div>
    </div>
  );
}

export default Sidebar;
