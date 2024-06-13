import { zohoFetch } from '@/helpers/zoho/zoho';

async function Product({ params }: { params: {productId: string} }) {
  const {productId} = params;

  // fetch all the products

  return (
    <main>
      <h1>Products page - {productId}</h1>
    </main>
  );
}

export default Product;