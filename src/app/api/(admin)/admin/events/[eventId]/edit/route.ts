import mongoose from 'mongoose';
import dbConnect from '../../../../../../../lib/dbConnect';
import Event from '../../../../../../../models/event';
import { EventType } from '../../../../../../../types/event';
import { AddEventValidationSchema } from '../../../../../../../validation/event';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { bucketName, getS3Client } from '@/lib/s3Client';
import { DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(
  req: NextRequest,
  { params }: { params: { eventId: string }},
) {
  const { eventId } = params;

  try {
    // if the product id is invalid return error
    if (mongoose.isValidObjectId(eventId) === false) {
      return NextResponse.json(
        { message: 'Invalid event id' }, 
        { status: 400 }
      );
    }

    const formData = await req.formData();

    // get the data, poster and media
    const poster = formData.get('poster') as File;
    const media = formData.getAll('media') as File[];
    const deleteMedia: string[] = JSON.parse(formData.get('deleteMedia') as string);
    const eventData: (EventType | null) = JSON.parse(formData.get('eventData') as string);

    // if any of the data is missing return error
    if (!eventData) {
      return NextResponse.json(
        { message: 'Missing data.' },
        { status: 400 }
      );
    }

    // check if the event being edited is found
    const event: (EventType | null) = await Event.findById(eventId);

    if (!event) {
      return NextResponse.json(
        { message: 'Event not found.' },
        { status: 404 }
      );
    }

    // check the validity of the data
    const validateData = AddEventValidationSchema.safeParse(eventData);

    if (validateData.success === false) {
      let errorMessage = '';
      const errorObj: { [key: string]: string} = {};

      validateData.error.errors.forEach((error) => {
        errorMessage += `${error.message}\n`;
        errorObj[error.path[0]] = error.message;
      });

      return NextResponse.json(
        { 
          message: errorMessage,
          error: errorObj,
        }, 
        { status: 400 }
      );
    }

    const s3Client = getS3Client();

    // if new poster is added, upload it and save the path
    if (poster) {
        const posterExtension = poster.name.split('.').pop();
        
        const awsFileName = `event/${event._id}_poster.${posterExtension}`;
        const awsFileUrl = `${process.env.AWS_S3_BASE_URL}/${awsFileName}`;
        
        // Convert Blob to ArrayBuffer, then to Buffer
        const arrayBuffer = await poster.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // create a new put object command with parameters
        const putObjectParams = {
          Bucket: bucketName,
          Key: awsFileName,
          Body: buffer,
          ContentType: poster.type
        };

        const putObjectCommand = new PutObjectCommand(putObjectParams);
        await s3Client.send(putObjectCommand);
  
        // add new poster path to the data
        eventData.poster = {
          key: awsFileName,
          url: awsFileUrl
        };
    }

    // if some media files were marked to be deleted, remove them
    const filteredMedia: {key:string, url:string}[] = [];
    if (deleteMedia) {      
      const deleteMediaSet = new Set(deleteMedia);
      const currMedia = event.media;

      const deleteMediaKeys: string[] = [];
      currMedia.forEach((mediaObj) => {
        // if the file is marked to be deleted, delete them
        if (deleteMediaSet.has(mediaObj.key)) {
         deleteMediaKeys.push(mediaObj.key); 
        } else {
          filteredMedia.push(mediaObj);
        }
      });

      const deleteCommand = new DeleteObjectsCommand({ 
        Bucket: bucketName, 
        Delete: {
          Objects: deleteMediaKeys.map((k) => ({ Key: k }))
        },
      });
  
      await s3Client.send(deleteCommand);
    }

    
    const uploadedMediaPaths = [];

    // if additional media exists, upload them to s3
    // avoid duplicate image names
    let imageIndex = 0;
    for (let i = 0; i < filteredMedia.length; i += 1) {
      const imageKey = filteredMedia[i].key;
      const number = parseInt(imageKey.split('_')[1].split('.')[0]);
      if (number > imageIndex) imageIndex = number;
    }
    imageIndex += 1;

    if (media) {
      for(let i = 0; i < media.length; i += 1) {
        const image = media[i];

        // get file extension
        const extension = image.name.split('.').pop();
        
        const awsFileName = `event/${event._id}_${imageIndex}.${extension}`;
        const awsFileUrl = `${process.env.AWS_S3_BASE_URL}/${awsFileName}`;
        
        // Convert Blob to ArrayBuffer, then to Buffer
        const arrayBuffer = await image.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // create a new put object command with parameters
        const putObjectParams = {
          Bucket: bucketName,
          Key: awsFileName,
          Body: buffer,
          ContentType: image.type
        };

        const putObjectCommand = new PutObjectCommand(putObjectParams);
        await s3Client.send(putObjectCommand);

        uploadedMediaPaths.push({
          key: awsFileName,
          url: awsFileUrl
        });
        imageIndex += 1;
      };
    }

    // save other event data to the db and retrieve the eventId
    await dbConnect();
    
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId, 
      {
        ...validateData.data,
        media: [...uploadedMediaPaths, ...filteredMedia],
      }, 
      {returnOriginal: false}
    );

    // revalidate cache
    revalidatePath('/events');
    revalidatePath(`/events/${eventId}`);

    return NextResponse.json(
      { message: 'Successfully edited event' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}