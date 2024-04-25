import { getZohoAxiosInstance } from "@/helpers/axios/zoho";

async function Product({ params }: { params: {productId: string} }) {
  const {productId} = params;

  // fetch all the products
  const zohoOrgId = process.env.ZOHO_ORG_ID!;
  const fetchProductsUrl = `${process.env.ZOHO_BASE_API_URL!}/items?organization_id=${zohoOrgId}`;
  const getProductsRes = await getZohoAxiosInstance().get(fetchProductsUrl);
  console.log(getProductsRes.data);

  return (
    <main>
      <h1>Products page - {productId}</h1>
    </main>
  );
}

export default Product;