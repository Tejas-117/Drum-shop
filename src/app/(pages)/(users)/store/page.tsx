import NeedHelp from '@/app/components/needHelp/needHelp';
import styles from './store.module.css';
import AdsCarousel from '@/app/components/carousel/store/ads/adsCarousel';
import Image from 'next/image';
import Link from 'next/link';
import { BsArrowRight } from 'react-icons/bs';
import ProductCategoryList from '@/app/components/store/categoryList/categoryList';
import { ProductType } from '@/types/product';
import { getUser } from '@/helpers/auth/getUser';

type CategoryDataType = {
  _id: string,
  products: ProductType[],
}

type ResponseType = {
  categoryData: CategoryDataType[] 
} 

async function fetchStoreData() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/products?store=true`,
      { next: {revalidate: 3600} }
    );
    return await res.json();
  } catch (error) {
    return { data: { categoryData: [] } };
  }
}

async function Store() {
  const res = await fetchStoreData();
  const data: ResponseType = res.data;

  const user = await getUser();

  return (
    <main className={styles.main}>
      {/* ads carousel */}
      <div className={styles.ads_carousel}>
        <AdsCarousel />
      </div>

      {/* shop by brand container */}
      <section className={styles.brand_container}>
        <h1>Shop by brand</h1>
        <p>Looking for a specific brand? we’ve got you covered.</p>

        <div className={styles.brand_image_container}>
          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_1.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_2.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_3.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_4.svg'}
              alt='available brand'
              fill={true}
            />
          </div>

          <div className={styles.brand_image}>
            <Image
              src={'/images/home/brand_image_5.svg'}
              alt='available brand'
              fill={true}
            />
          </div>
        </div>

        <Link href='/store'>
          See more brands
          <BsArrowRight />
        </Link>
      </section>

      {/* convinient purchase container */}
      <section className={styles.purchase_info_container}>
        <h1>Convinient purchase</h1>
        <p>
          Discover a world of exceptional services designed to enhance your 
          purchase and bring your musical aspirations to life.
        </p>

        <div className={styles.purchase_info_point_container}>
          <div className={styles.purchase_info_point}>
            <h2>Easy EMI</h2>
            <p>
              We provide easy EMI options such as Bajaj Finance & Credit Card EMI Options.
            </p>
          </div>

          <div className={styles.purchase_info_point}>
            <h2>Free Installation</h2>
            <p>
              Enjoy hassle-free setup with our complimentary installation service, 
              ensuring your drum kit is tuned to perfection from the moment you bring it home
            </p>
          </div>

          <div className={styles.purchase_info_point}>
            <h2>Consultation</h2>
            <p>
              Expert advice tailored to your needs ensures you find the perfect percussion gear.
              Our dedicated team is here to make your purchasing experience smooth and enjoyable.
            </p>
          </div>
        </div>
      </section>

      {/* shop by category */}
      <section className={styles.shop_by_category_container}>
        <h1>SHOP BY CATEGORY</h1>
        
        {data.categoryData.map((ctData, idx: number) => {
          return (
            <ProductCategoryList 
              categoryList={ctData}
              key={idx}
              user={user}
            />
          );
        })}
      </section>

      <NeedHelp />
    </main>
  );
}

export default Store