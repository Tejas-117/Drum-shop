import mongoose from 'mongoose';
import { revalidatePath } from 'next/cache';

import dbConnect from '../../../../../../../lib/dbConnect';
import { NextRequest, NextResponse } from 'next/server';
import Event from '../../../../../../../models/event';
import { EventType } from '../../../../../../../types/event';
import { bucketName, getS3Client } from '@/lib/s3Client';
import { DeleteObjectsCommand } from '@aws-sdk/client-s3';

export async function DELETE(
  req: NextRequest, 
  { params }: { params: { eventId: string }}
) {
  try {
    const { eventId } = params;

    // if the eventId is invalid return error
    if ((!eventId) || (!mongoose.isValidObjectId(eventId))) {
      return NextResponse.json(
        { message: 'Invalid event id' },
        { status: 400 }
      );
    }

    await dbConnect();

    const event: (EventType | null) = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found' },
        { status: 400 }
      );  
    }

    const s3Client = getS3Client();

    // delete the images
    const eventMedia = [event.poster, ...event.media];
    const deleteCommand = new DeleteObjectsCommand({ 
      Bucket: bucketName, 
      Delete: {
        Objects: eventMedia.map((media) => ({ Key: media.key }))
      },
    });

    await s3Client.send(deleteCommand);

    await Event.findByIdAndDelete(eventId);

    // revalidate the cache of the eventId and the store
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);

    return NextResponse.json(
      { message: 'Successfully deleted event' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}