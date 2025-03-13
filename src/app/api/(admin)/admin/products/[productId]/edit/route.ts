import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink } from 'node:fs/promises';
import mongoose from 'mongoose';
import { join } from 'node:path'
;
import { AddProductValidationSchema } from '../../../../../../../validation/product';
import Product from '../../../../../../../models/product';
import dbConnect from '../../../../../../../lib/dbConnect';
import { ProductType } from '../../../../../../../types/product';
import { revalidatePath } from 'next/cache';
import { bucketName, getS3Client } from '@/lib/s3Client';
import { DeleteObjectCommand, DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

const ROOT_DIR = process.cwd();
const UPLOAD_DIR = join(ROOT_DIR, 'public', 'uploads');

type OldImageType = {
  url: string,
  key: string,
  delete: boolean,
  isPrimary: boolean,
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string }},
) {
  const { productId } = params;

  try {
    // if the product id is invalid return error
    if (mongoose.isValidObjectId(productId) === false) {
      return NextResponse.json(
        { message: 'Invalid product id' }, 
        { status: 400 }
      );
    }

    // get all the images and product data from the request object.
    const formData = await req.formData();
    const productData = JSON.parse(formData.get('productData') as string);
    const uploadedImages = formData.getAll('images') as File[];
    const oldImages: OldImageType[] = JSON.parse(formData.get('oldImages') as string);

    // if any of the data is missing return error
    if (!productData || (!uploadedImages && !oldImages)) {
      return NextResponse.json(
        { message: 'Missing data' },
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

    // get the images marked to be deleted
    let imagesToDelete: OldImageType[] = [];
    oldImages.forEach((img) => {
      if (img.delete === true) {
        imagesToDelete.push(img);
      }
    });

    // no images uploaded and all the old images are deleted, then return error
    if ((uploadedImages.length === 0) && (imagesToDelete.length === oldImages.length)) {
      return NextResponse.json(
        { message: 'Please upload product images' },
        { status: 400 }
      );
    }

    //////////////////////////////////// Data validation errors so far //////////////////////////////////////

    await dbConnect();

    // retrieve the product
    const product: (ProductType | null) = await Product.findById(productId);

    // if the product is not present, return error
    if (!product) {
      return NextResponse.json(
        { message: 'Product not found' }, 
        { status: 400 }
      );
    }
    
    /**
     * Operations to be performed on the images
     * (1). delete the images tagged for removal
     * (2). upload new images
     * (3). check for the primary image
    */

    // (1). delete the images tagged for removal
    let filteredImgs: {key: string, url: string}[] = [];
    if (imagesToDelete.length > 0) {
      // add the urls of the image to be deleted to the set
      const removeImgsIdx = new Set();
      const removeImgsKeyarr: string[] = [];
      
      imagesToDelete.forEach(async (imgToDelete) => {
        removeImgsIdx.add(imgToDelete.key);
        removeImgsKeyarr.push(imgToDelete.key);
      });
              
      // delete the images from s3
      const s3Client = getS3Client();
      const deleteCommand = new DeleteObjectsCommand({ 
        Bucket: bucketName, 
        Delete: {
          Objects: removeImgsKeyarr.map((k) => ({ Key: k }))
        },
      });
  
      await s3Client.send(deleteCommand);

      // from the stored images, filter out the images not to be deleted.
      product.images.forEach((img) => {
        if (removeImgsIdx.has(img.key) === false) {
          filteredImgs.push(img);
        }
      });
    } else {
      filteredImgs = [...product.images];
    }

    // (2). upload new images
    const uploadedImagePaths = [];
    if (uploadedImages.length > 0) {
      // TODO: upload images to cloud storage

      // avoid duplicate image names
      let imageIndex = 0;
      for (let i = 0; i < filteredImgs.length; i += 1) {
        const imageKey = filteredImgs[i].key;
        const number = parseInt(imageKey.split('_')[1].split('.')[0]);
        if (number > imageIndex) imageIndex = number;
      }
      imageIndex += 1;

      for(let i = 0; i < uploadedImages.length; i += 1) {
        const image = uploadedImages[i];

        const extension = image.name.split('.').pop();
        
        // uploading to s3 bucket
        const awsFileName = `product/${product._id}_${imageIndex}.${extension}`;
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
        await s3Client.send(putObjectCommand);
        uploadedImagePaths.push({
          key: awsFileName,
          url: awsFileUrl
        });

        imageIndex += 1;
      };
    }

    // (3). check for the primary image
    // check if the primary image is from the oldImages
    let primaryImg = oldImages.find((img) => (img.delete === false) && (img.isPrimary === true));
    let allImgPaths: {url: string, key: string}[] = [];

    // now handle the primary image
    if (primaryImg) {
      // if the primary image was in the old images, then add it to the start of the path
      const primaryImgKey = primaryImg.key;
      const otherImgs = filteredImgs.filter((img) => img.key !== primaryImgKey);

      allImgPaths = [primaryImg, ...otherImgs, ...uploadedImagePaths];
    } else {
      // if the primary image was not in the old images, then it must be in new images
      allImgPaths = [...uploadedImagePaths, ...filteredImgs];
    }

    // add the images to the product
    await Product.findByIdAndUpdate(productId, {...validateData.data, images: allImgPaths });

    // revalidate cache
    revalidatePath('/store');
    revalidatePath(`/products/${productId}`);

    return NextResponse.json(
      { message: 'Successfully edited product.' },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}