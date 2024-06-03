'use client';

import { FormEvent, useState } from 'react';
import styles from './search.module.css';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';

function ProductsSearch() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const [search, setSearch] = useState(searchParams.get('query')?.toString());

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);

    if (search) {
      params.set('query', search);
    } else {
      params.delete('query');
    }

    replace(`${pathname}?${params.toString()}`);
  }

  return (
    <form 
      onSubmit={handleSearch}
      className={styles.search_container}
    >
      <input 
        type="text" 
        placeholder='Search items by name'
        name='item_name'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button>Search</button>
    </form>
  );
}

export default ProductsSearch;
