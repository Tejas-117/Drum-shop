'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { GrAdd } from 'react-icons/gr';
import { BeatLoader } from 'react-spinners';
import axios from 'axios';
import toast from 'react-hot-toast';

import styles from './addEvent.module.css';
import { AddEventValidationSchema } from '@/validation/event';
import { EventType, ArtistType } from '@/types/event';

function AddEvent() {
  const [isLoading, setIsLoading] = useState(false);

  const initialFormState: EventType = {
    name: '',
    date: '',
    time: '23:00',
    status: 'ongoing',
    details: '',
    featuredArtists: [],
    featuredProducts: [],
  }

  // state to input featuredArtists and featuredProducts
  const [artistInput, setArtistInput] = useState<ArtistType>({
    name: '',
    link: ''
  });
  const [productInput, setProductInput] = useState('');

  // state to represent form state
  const [formState, setFormState] = useState(initialFormState);

  // poster and additional media
  const [poster, setPoster] = useState<File | null>(null);
  const [media, setMedia] = useState<FileList | null>(null);

  // function to update the form state
  function updateFormState(name: string, value: string) {
    // on input reset the state of the input element
    resetInputElement(name);

    const newFormState: EventType = {...formState};
    const keyname = name as keyof EventType;

    if (keyname === 'featuredArtists') return;

    if (keyname === 'featuredProducts') {
      newFormState[keyname].push(value);
    } else {
      newFormState[keyname] = value;
    }

    setFormState(newFormState);
  }

  // function to add the artist entered to the form state
  function addFeaturedArtist() {
    setFormState((prevData => {
      return {
        ...prevData,
        featuredArtists: [...prevData.featuredArtists, artistInput],
      }
    }));
    setArtistInput({name: '', link: ''});
  }
  
  // function to add a featured product to form state
  function addFeaturedProduct() {
    setFormState((prevData) => {
      return {
        ...prevData,
        featuredProducts: [...prevData.featuredProducts, productInput],
      }
    });
    setProductInput('');
  }

  // function to validate fields
  function validateField(name: string, value: (string | number)) {
    // get the appopriate schema for the field
    const schemaShape = AddEventValidationSchema.shape;
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
  function addClassToInformUser(name: string, status: 'invalid' | 'valid', message ?: string) {
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

  
  // function to handle image uploads
  function handleImageUpload(e: ChangeEvent<HTMLInputElement>, type: ('poster' | 'media')) {
    if (!e.target.files) return;
    
    if (type === 'media') {
      const images = Array.from(e.target.files);
      setMedia(e.target.files);
      
      let invalidFileType = 0;
      let invalidFileSize = 0;

      // reject files that are above limited size and create object url to display
      const fileUrls = images
                        .filter(img => {
                          if (img.type.split('/')[0] === 'image') {
                            return true;
                          } else {                            
                            invalidFileType += 1;
                          }
                        })
                        .map(img => URL.createObjectURL(img)) 
      
      
      // setDisplayImgs(fileUrls);

      // display warning message if any files were rejected
      if (invalidFileSize > 0) {
        toast.error(`${invalidFileSize} images rejected as they were above size limit`)
      }
      if (invalidFileType > 0) {
        toast.error(`${invalidFileType} files rejected, as the file type was invalid`)  
      }
    } else if (type === 'poster') {
      const image = e.target.files[0];
      setPoster(image);

      if (image.type.split('/')[0] !== 'image') {
        toast.error('Poster rejected as the file type was invalid');
      }
    }
  }

  // function to submit the data to the api
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // validate the user input
    const validationRes = AddEventValidationSchema.safeParse(formState);

    // if the input data is invalid, show error
    if (!validationRes.success) {
      toast.error('Invalid input data');
      validationRes?.error.errors.forEach(error => {
        const { path, message } = error;
        addClassToInformUser(path[0].toString(), 'invalid', message);
      });
    } else if (!poster) {
      // if the poster is not uploaded, display error
      toast.error('Please upload poster of the event');
    } else { 
      setIsLoading(true);
      
      // if all the data is valid, send data to the server
      const formData = new FormData();
      formData.append('eventData', JSON.stringify(formState));      

      if (poster) {
        formData.append('poster', poster);
      }
      
      if (media) {
        for (let i = 0; i < media.length; i += 1) {
          formData.append('media', media[i]); 
        }
      }

      try {
        const res = await axios.post(
          '/api/admin/events/add',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            },
            withCredentials: true,
          }
        );

        const successMessage = res.data.message;
        toast.success(successMessage);

        // clear the form state
        setFormState(initialFormState);
        setMedia(null);
        setPoster(null);

        // reset input elements state
        const form = document.querySelector(`.${styles.add_event_form}`);
        const elements = form?.querySelectorAll('input, textarea');

        elements?.forEach((element) => {
          element.classList.remove(`${styles.input_valid}`);
          element.classList.remove(`${styles.input_invalid}`);
        });

        // clear the images input
        const imageInput: HTMLInputElement = document.querySelector('input[type="file"]')!;
        imageInput.value = '';
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
    <main className={styles.main}>
      <h1>Add a new event</h1>

      <form 
        className={styles.add_event_form}
        onSubmit={(e) => handleSubmit(e)}
        onKeyDown={(e) => {
          if (e.code === 'Enter') {
            e.preventDefault();
          }
        }}
      >
        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor='name'>Name</label>
            <input 
              type='text'
              name='name'
              value={formState.name}
              onChange={(e) => updateFormState('name', e.target.value)}
              onBlur={(e) => validateField('name', e.target.value)}
            />
            <span data-name='name' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor='date'>Date</label>
            <input 
              type='date'
              name='date'
              value={formState.date}
              onChange={(e) => updateFormState('date', e.target.value)}
              onBlur={(e) => validateField('date', e.target.value)}
            />
            <span data-name='date' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor='time'>Time</label>
            <input 
              type='time'
              name='time'
              value={formState.time}
              onChange={(e) => updateFormState('time', e.target.value)}
              onBlur={(e) => validateField('time', e.target.value)}
            />
            <span data-name='time' className={styles.error_msg}></span>
          </div>
        </div>

        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor='details'>Details</label>
            <textarea 
              name='details' 
              value={formState.details}
              onChange={(e) => updateFormState('details', e.target.value)}
              onBlur={(e) => validateField('details', e.target.value)}
            />
            <span data-name='details' className={styles.error_msg}></span>
          </div>

          <div className={styles.form_control}>
            <label htmlFor="status">Status</label>
            <select 
              name="status"
              value={formState.status}
              onChange={(e) => updateFormState('status', e.target.value)}
            >
              <option value="ongoing">Ongoing</option>
              <option value="expired">Expired</option>
              <option value="highlights">Highlights</option>
            </select>
          </div>
        </div>

        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor='poster'>Poster</label>
            <input 
              type='file' 
              name='poster'
              accept='image/*'
              onChange={(e) => handleImageUpload(e, 'poster')}
            />
          </div>

          {(formState.status === 'highlights') &&
            <div className={styles.form_control}>
              <label htmlFor="media">Additional media (for highlights)</label>
              <input
                type="file"
                name='media'
                multiple
                onChange={(e) => handleImageUpload(e, 'media')}
              />
            </div>
          }
        </div>

        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor="artist">Featured artists</label>

            <div className={styles.artist_input}>
              <div>
                <label htmlFor="artistName">Name</label>
                <input
                  type="text"
                  name='artist'
                  placeholder='Enter artist name'
                  value={artistInput.name}
                  onChange={(e) => {
                    setArtistInput((prevData) => {
                      return {
                        ...prevData,
                        name: e.target.value,
                      }
                    })
                  }}
                />
              </div>

              <div>
                <label htmlFor="artistLink">Link (if any)</label>
                <input
                  type="text"
                  name='link'
                  placeholder='Enter any link related to artist'
                  value={artistInput.link}
                  onChange={(e) => {
                    setArtistInput((prevData) => {
                      return {
                        ...prevData,
                        link: e.target.value,
                      }
                    })
                  }}
                />
              </div>

              <GrAdd 
                className={styles.add_input}
                onClick={() => addFeaturedArtist()} 
                style={{marginTop: '1.5rem'}}
              />
            </div>

            <div className={styles.added_artists}>
              {formState.featuredArtists.map((artist, idx) => {
                return (
                  <p key={idx}>
                    <span>{artist.name}</span>
                    <span>{artist.link}</span>
                  </p>
                );
              })}
            </div>
          </div>          
        </div>

        <div className={styles.form_part}>
          <div className={styles.form_control}>
            <label htmlFor="featuredProduct">Featured products</label>

            <div className={styles.product_input}>
              <input
                type="text"
                name='featuredProduct'
                placeholder='Enter featured product id'
                value={productInput}
                onChange={(e) => setProductInput(e.target.value)}
              />

              <GrAdd className={styles.add_input} onClick={() => addFeaturedProduct()} />
            </div>

            <div className={styles.featured_products_display}>
              {formState.featuredProducts.map((product, idx) => {
                return (
                  <p key={idx}>{product}</p>
                )
              })}
            </div>
          </div>
        </div>

        <button
          className={styles.submit_btn}
          type='submit'
        >
          {(isLoading === true) ?
            <BeatLoader color='white' /> :  
            'Add product'
          }
        </button>
      </form>
    </main>
  );
}

export default AddEvent