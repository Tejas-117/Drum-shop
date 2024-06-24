import ProductComponent from '@/app/components/product/product';
import { getUser } from '@/helpers/auth/getUser';

async function fetchProduct(productId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/${productId}`,
    { next: {revalidate: 3600} }
  );
  const data = await res.json();

  if (res.status !== 200) {
    return null;
  }

  return data.product;
}

async function Product({ params }: { params: {productId: string} }) {
  const {productId} = params;
  const product = await fetchProduct(productId);

  const user = await getUser();
 
  // if data couldn't be fetched, display this component instead
  if (!product) {
    return <main>Error fetching data.</main>;
  }

  return (
    <main
      style={{minHeight: 'unset'}}
    >
      <ProductComponent product={product} user={user} />
    </main>
  );
}

export default Product;