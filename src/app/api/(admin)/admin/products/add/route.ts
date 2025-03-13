import { NextRequest, NextResponse } from 'next/server';
import { AddProductValidationSchema } from '../../../../../../validation/product';
import Product from '../../../../../../models/product';
import dbConnect from '../../../../../../lib/dbConnect';
import { revalidatePath } from 'next/cache';
import { bucketName, getS3Client } from '@/lib/s3Client';
import { PutObjectCommand } from '@aws-sdk/client-s3';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // get all the images and product data
    const productData = JSON.parse(formData.get('productData') as string);
    const images = formData.getAll('images') as File[];

    // if any of the data is missing return error
    if (!productData || !images) {
      return NextResponse.json(
        { message: 'Missing data.' },
        { status: 400 }
      );
    }

    // if the images are absent return error
    if (images.length === 0) {
      return NextResponse.json(
        { message: 'Please upload product images' },
        { status: 400 }
      );
    }

    // check the validity of the data recieved and return appropriate errors
    const validateData = AddProductValidationSchema.safeParse(productData);        
    if (validateData.success === false) {
      let errorMessage = '';
      const errorObj: { [key:string]: string } = {};

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

    // save other product data to db and retrieve the productId
    await dbConnect();
    const newProduct = new Product(validateData.data);

    const imagePaths = [];
    for(let i = 0; i < images.length; i += 1) {
      const image = images[i];

      // get file extension
      // TODO: check if the extension belongs to the image type only
      const extension = image.name.split('.').pop();

      // uploading to s3 bucket
      const awsFileName = `product/${newProduct._id}_${i}.${extension}`;
      const awsFileUrl = `${process.env.AWS_S3_BASE_URL}/${awsFileName}`;
      const s3Client = getS3Client();

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
      
      // send the command to upload image
      const fileUploadRes = await s3Client.send(putObjectCommand);
      imagePaths.push({
        key: awsFileName,
        url: awsFileUrl
      });
    };

    // add the images to the product
    newProduct.images = imagePaths;

    await newProduct.save();

    // revalidate the store cache
    revalidatePath('/store');

    return NextResponse.json(
      { message: 'Successfully added product.' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}