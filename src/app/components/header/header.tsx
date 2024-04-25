import Image from 'next/image';
import styles from './header.module.css';
import { LuSearch } from 'react-icons/lu';
import { FaCircleUser } from 'react-icons/fa6';
import { BiSolidDownArrow } from 'react-icons/bi';
import { GiHamburgerMenu } from 'react-icons/gi';
import Link from 'next/link';

function Header() {
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
          <li><a>Services</a></li>
          <li><a>Events</a></li>
          <li><a>Contact Us</a></li>
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