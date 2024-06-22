
async function Product({ params }: { params: {productId: string} }) {
  const {productId} = params;

  return (
    <main>
      <h1>Products page - {productId}</h1>
    </main>
  );
}

export default Product;