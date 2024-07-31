import Image from 'next/image';
import styles from './header.module.css';
import { LuSearch } from 'react-icons/lu';
import { FaCircleUser } from 'react-icons/fa6';
import { BiSolidDownArrow } from 'react-icons/bi';
import { GiHamburgerMenu } from 'react-icons/gi';
import { MdOutlineShoppingBasket } from 'react-icons/md';
import Link from 'next/link';

type CartPropType = {
  cartId: string,
  productCount: number,
}

function Header({ cart }: { cart: (CartPropType | null) }) {
  const cartCount = cart?.productCount || 0;  

  return (
    <nav className={styles.navbar}>
      {/* hamburger icons that will be displayed in tablet and mobile */}
      <GiHamburgerMenu className={styles.hamburger_menu} />

      {/* logo image in the header */}
      <Link href='/'>
        <div className={styles.navbar_logo}>
            <Image
              src={'/images/logo.png'}
              alt='logo'
              priority={true}
              fill={true}          
            />
        </div>
      </Link>

      {/* search container in the header */}
      <div className={styles.search_container}>
        <input
          type='text'
          placeholder='Search products'
        />

        {/* search icon */}
        <LuSearch />
      </div>

      {/* navbar with links */}
      <div className={styles.nav_links}>
        <ul>
          <li><Link href={'/store'}>Store</Link></li>
          <li><Link href={'/events'}>Events</Link></li>
          <li><Link href={'/contactus'}>Contact Us</Link></li>
          <li style={{position: 'relative'}}>
            <Link href={'/cart'}>
              <MdOutlineShoppingBasket className={styles.cart_icon} />
            </Link>

            {(cartCount > 0) &&
              <span className={styles.cart_notification}>{cartCount}</span>
            }
          </li>
        </ul>
      </div>

      {/* user icon */}
      <div className={styles.user}>
        <FaCircleUser className={styles.user_icon}/>
        <BiSolidDownArrow className={styles.user_icon_arrow} />
      </div>
    </nav>
  )
}

export default Header;