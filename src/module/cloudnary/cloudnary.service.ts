import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryConfig } from '../auth/config/cloudinary-config';
import { error } from 'node:console';
import { url } from 'node:inspector';

@Injectable()
export class CloudnaryService {

    private readonly cloudinary;

    constructor(private readonly cloudinaryConfig: CloudinaryConfig) {
        this.cloudinary = cloudinaryConfig.getCloudinary()
    }

    async uploadImage(file: Express.Multer.File) {
        return new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    {
                        folder: 'chotot',
                    },
                    (error, result) => {
                        if (error) return reject(error);

                        resolve({
                            url: result?.secure_url,
                            publicId: result?.public_id
                        })
                    }
                )

                .end(file.buffer)
        })
    }

    async uploadImages(files: Express.Multer.File[]) {
        const uploadPromises = files.map(
            (file) =>
                new Promise<{
                    url: string;
                    publicId: string;
                }>((resolve, reject) => {
                    cloudinary.uploader
                        .upload_stream(
                            {
                                folder: 'chotot',
                            },
                            (error, result) => {
                                if (error) {
                                    return reject(error);
                                }

                                resolve({
                                    url: result!.secure_url,
                                    publicId: result!.public_id,
                                });
                            },
                        )
                        .end(file.buffer);
                }),
        );

        return Promise.all(uploadPromises);
    }
}
