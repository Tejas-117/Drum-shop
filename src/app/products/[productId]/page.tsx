import { zohoFetch } from '@/helpers/axios/zoho';

async function Product({ params }: { params: {productId: string} }) {
  const {productId} = params;

  // fetch all the products
  const zohoOrgId = process.env.ZOHO_ORG_ID!;
  const fetchProductsUrl = `/items?organization_id=${zohoOrgId}`;

  const data = await zohoFetch(fetchProductsUrl, {next: {revalidate: 60}});
  console.log(data);

  return (
    <main>
      <h1>Products page - {productId}</h1>
    </main>
  );
}

export default Product;