'use client';

import { useEffect, useState } from 'react';
import styles from './manageAddress.module.css';
import AddAddress from '../add/addAddress';

type UserType = {
  fullName: string,
  email: string,
  phone: string,
}

function ManageAddress({ user } : { user: UserType }) {
  const [showAddressForm, setShowAddressForm] = useState(false);

  // function to fetch all the current addresses of the user
  async function fetchAddresses() {

  }

  useEffect(() => {

  }, []);

  useEffect(() => {
    if (showAddressForm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showAddressForm]);

  return (
    <main className={styles.main}>

      {/* show address form */}
      {(showAddressForm) && 
        <AddAddress 
          setShowAddressForm={setShowAddressForm}
          user={user}
        />
      }

      <button onClick={() => setShowAddressForm(true)}>
        Add Address
      </button>
    </main>
  );
}

export default ManageAddress;
