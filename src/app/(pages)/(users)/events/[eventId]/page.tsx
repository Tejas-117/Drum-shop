'use client';

import { useParams } from 'next/navigation';

function EventPage() {
  const urlParams = useParams();

  return (
    <div>{urlParams.eventId}</div>
  )
}

export default EventPage;
