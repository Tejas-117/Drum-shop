'use client';

import styles from './eventActions.module.css';
import toast from 'react-hot-toast';

function EventActions() {
  // function to copy link to the clipboard
  async function shareLink() {
    try {
      await navigator.clipboard.writeText(document.location.href);
      toast.success('Copied URL to clipboard')
    } catch (error: any) {
      toast.error(error.message || 'Error copying url');
    }    
  }

  // TODO: implement functionality to set a reminder
  function setReminder() {}

  return (
    <div className={styles.event_actions}>
      <button onClick={() => shareLink()}>Copy URL</button>
      <button onClick={() => setReminder()}>Set a reminder</button>
    </div>
  );
}

export default EventActions