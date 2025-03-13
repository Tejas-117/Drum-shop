import dbConnect from '../../../../../../lib/dbConnect';
import Event from '../../../../../../models/event';
import { EventType } from '../../../../../../types/event';
import { AddEventValidationSchema } from '../../../../../../validation/event';
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { bucketName, getS3Client } from '@/lib/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // get the data, poster and media
    const poster = formData.get('poster') as File;
    const media = formData.getAll('media') as File[];
    const eventData: (EventType | null) = JSON.parse(formData.get('eventData') as string);

    // if any of the data is missing return error
    if (!eventData || !poster) {
      return NextResponse.json(
        { message: 'Missing data.' },
        { status: 400 }
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

    // save other event data to the db and retrieve the eventId
    await dbConnect();
    const newEvent = new Event(validateData.data);

    // upload poster to S3
    const s3Client = getS3Client();
    if (poster) {
      const posterExtension = poster.name.split('.').pop();

      const awsFileName = `event/${newEvent._id}_poster.${posterExtension}`;
      const awsFileUrl = `${process.env.AWS_S3_BASE_URL}/${awsFileName}`;
      newEvent.poster = {
        key: awsFileName,
        url: awsFileUrl,
      };

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
    }

    // if additional media exists, upload to S3
    if (media) {
      const mediaPaths: {key: string, url: string}[] = [];
      for(let i = 0; i < media.length; i += 1) {
        const image = media[i];
  
        // get file extension
        const extension = image.name.split('.').pop();

        const awsFileName = `event/${newEvent._id}_${i}.${extension}`;
        const awsFileUrl = `${process.env.AWS_S3_BASE_URL}/${awsFileName}`;
        mediaPaths.push({
          key: awsFileName,
          url: awsFileUrl,
        });

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
      };

      newEvent.media = mediaPaths;
    }

    await newEvent.save();

    // revalidate cache
    revalidatePath('/events');

    return NextResponse.json(
      { message: 'Successfully saved event' },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}