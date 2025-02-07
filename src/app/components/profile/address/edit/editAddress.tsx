'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import styles from './editAddress.module.css';
import { ImCancelCircle } from 'react-icons/im';
import toast from 'react-hot-toast';
import ShippingAddressSchema from '../../../../../validation/shippingAddress';
import axios from 'axios';
import { Address } from '../../../../../types/address';
import { BeatLoader } from 'react-spinners';

type UserType = {
  fullName: string,
  email: string,
  phone: string,
}

type PropsType = {
  setShowEditForm: Dispatch<SetStateAction<boolean>>,
  user: UserType | null,
  address: Address | null,
  allAddress: Address[],
  setAllAddress: Dispatch<SetStateAction<Address[]>>
}

function EditAddress({ setShowEditForm, user, address, allAddress, setAllAddress }: PropsType) {
  const [formState, setFormState] = useState(address);
  const [isLoading, setIsLoading] = useState(false);

  // function to update form state with form field values
  function updateFormState(name: string, value: string) {
    if (!formState) return;

    resetInputElement(name);

    const newFormState = {...formState};
    const keyname = name as keyof Address;
    newFormState[keyname] = value;

    setFormState(newFormState);
  }

  // function to validate fields
  function validateField(name: string, value: string) {
    // get the appopriate schema for the field
    const schemaShape = ShippingAddressSchema.shape;
    const fieldSchemaShape = schemaShape[name as keyof typeof schemaShape];

    const validateField = fieldSchemaShape.safeParse(value);

    // if the field has an invalid value, show error
    if (validateField.success === false) {
      // display the error message one at a time
      const issue = validateField.error.issues[0];
      const message = issue.message;

      addClassToInformUser(name, 'invalid', message);
    } else {
      // add success class to the input field
      addClassToInformUser(name, 'valid');
    }
  }

  // function to add different classes to input elements based on valid/invalid inputs
  function addClassToInformUser(name: string, status: 'invalid' | 'valid', message?: string) {
    // get the correct input element using the name attribute
    let inputElement = document.querySelector(`input[name="${name}"]`);

    // if input element is empty, check for textarea
    if (inputElement === null) {
      inputElement = document.querySelector(`textarea[name="${name}"]`)
    }

    // add the correct class and display message if needed
    if (status === 'invalid') {
      // inputElement.classList
      inputElement?.classList.add(styles.input_invalid);

      // if there is a message provided, display it
      const messageContainer = document.querySelector(`[data-name="${name}"]`);
      if (message && messageContainer) {
        messageContainer.innerHTML = message;
        messageContainer.classList.add(styles.display_error_message);
      }
    } else if (status === 'valid') {
      inputElement?.classList.add(styles.input_valid);
    }
  }

  // function to reset the classes added to inform user
  function resetInputElement(name: string) {
    let inputElement = document.querySelector(`input[name="${name}"]`);

    if (inputElement === null) {
      inputElement = document.querySelector(`textarea[name="${name}"]`)
    }

    inputElement?.classList.remove(styles.input_invalid);
    inputElement?.classList.remove(styles.input_valid);

    const messageContainer = document.querySelector(`[data-name="${name}"]`);
    if (messageContainer) {
      messageContainer.classList.remove(styles.display_error_message);
      messageContainer.innerHTML = '';
    }
  }

  // function to edit a address
  async function editAddress() {
    if (!formState) return;
    setIsLoading(true);

    // validate the input data
    const validationRes = ShippingAddressSchema.safeParse(formState);

    if (!validationRes.success) {
      // if validation fails, show error
      toast.error('Invalid input data');

      validationRes?.error.errors.forEach(error => {
        const { path, message } = error;
        addClassToInformUser(path[0].toString(), 'invalid', message);
      });
    } else {
      try {
        await axios.put(`/api/profile/address/${formState._id}`, { ...formState });
  
        toast.success('Successfully edited address');
        setShowEditForm(false);

        // update all address state
        setAllAddress((prevState) => {
          const addressIdx = prevState.findIndex((a) => a._id === formState._id);
          if (addressIdx == -1) return prevState;

          const newAddress = [...prevState];
          newAddress[addressIdx] = formState;
          return newAddress;
        });
      } catch (error: any) {
        const errorData = error.response.data;
        const errorMessage = errorData.message;
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  }

  return (
    <section className={styles.address_form_outer_container}>
      <div className={styles.address_form_container}>
        <div className={styles.popup_heading}>
          <h1>EDIT ADDRESS</h1>
          <div
            className={styles.cancel_icon}
            onClick={() => setShowEditForm(false)}
          >
            <ImCancelCircle size={20} />
          </div>
        </div>

        <form className={styles.add_address_form}>
          <div className={styles.left_grid}>
            <div className={styles.form_control}>
              <label htmlFor="name">NAME</label>
              <input
                type="text"
                name='name'
                value={formState?.name || ''}
                onChange={(e) => updateFormState('name', e.target.value)}
                onBlur={(e) => validateField('name', e.target.value)}
              />
              <span data-name='name' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="pinCode">PIN CODE</label>
              <input
                type="text"
                name='pinCode'
                value={formState?.pinCode || ''}
                onChange={(e) => updateFormState('pinCode', e.target.value)}
                onBlur={(e) => validateField('pinCode', e.target.value)}
              />
              <span data-name='pinCode' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="address">ADDRESS (AREA & STREET)</label>
              <textarea
                name='address'
                value={formState?.address || ''}
                onChange={(e) => updateFormState('address', e.target.value)}
                onBlur={(e) => validateField('address', e.target.value)}
              />
              <span data-name='address' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="landmark">LANDMARK</label>
              <input
                type="text"
                name='landmark'
                value={formState?.landmark || ''}
                onChange={(e) => updateFormState('landmark', e.target.value)}
              />
              <span data-name='landmark' className={styles.error_msg}></span>
            </div>
          </div>

          <div className={styles.right_grid}>
            <div className={styles.form_control}>
              <label htmlFor="phone">MOBILE NUMBER</label>
              <input
                type="text"
                name='phone'
                value={formState?.phone || ''}
                onChange={(e) => updateFormState('phone', e.target.value)}
                onBlur={(e) => validateField('phone', e.target.value)}
              />
              <span data-name='phone' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="city">CITY/TOWN/DISTRICT</label>
              <input
                type="text"
                name='city'
                value={formState?.city || ''}
                onChange={(e) => updateFormState('city', e.target.value)}
                onBlur={(e) => validateField('city', e.target.value)}
              />
              <span data-name='city' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="state">STATE</label>
              <input
                type="text"
                name='state'
                value={formState?.state || ''}
                onChange={(e) => updateFormState('state', e.target.value)}
                onBlur={(e) => validateField('state', e.target.value)}
              />
              <span data-name='state' className={styles.error_msg}></span>
            </div>

            <div className={styles.form_control}>
              <label htmlFor="addressType">ADDRESS TYPE</label>

              <div className={styles.radio_input_container}>
                <div>
                  <input
                    type="radio"
                    name='addressType'
                    value={'home'}
                    checked={formState?.addressType === 'home'}
                    onChange={(e) => updateFormState('addressType', e.target.value)}
                  />
                  <span> Home</span>
                </div>

                <div>
                  <input
                    type="radio"
                    name='addressType'
                    value={'work'}
                    checked={formState?.addressType === 'work'}
                    onChange={(e) => updateFormState('addressType', e.target.value)}
                  />
                  <span> Work</span>
                </div>
              </div>
            </div>
          </div>
        </form>

        <div className={styles.add_address_actions}>
          {(isLoading) ?
            <BeatLoader size={25} />:
            <>
              <button onClick={() => editAddress()}>Edit</button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                }}
              >
                Cancel
              </button>
            </>
          }
        </div>
      </div>
    </section>
  )
}

export default EditAddress