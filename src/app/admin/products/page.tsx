import styles from './products.module.css';
import ProductsSearch from '@/app/components/search/search';

// function to fetch all the products from zoho
async function fetchProductsFromZoho() {}

async function AdminProductsPage({
  searchParams,
}: {
  searchParams?: {
    query?: string,
  }
}) {
  // check for the query entered in the url
  const searchQuery = searchParams?.query || '';

  return (
    <main className={styles.main}>
      <ProductsSearch />
    </main>
  );
}

export default AdminProductsPage;