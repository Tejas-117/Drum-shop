import CartComponent from '@/app/components/cart/cartComponent';
import { cookies } from 'next/headers';

// function to fetch cart data of the user
async function fetchCart() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/cart`,
    { 
      cache: 'no-store',
      headers: { 
        // cookie should be added while using server-side fetch
        Cookie: cookies().toString()
      },
    },
  );
    
  const data = await res.json();
  return data;
}

async function CartPage() {
  const data = await fetchCart();

  return (
    <main>
      <CartComponent cartProp={data?.cart || null} />
    </main>
  );
}

export default CartPage;
