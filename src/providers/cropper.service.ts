import { Injectable } from '@angular/core';

import { AspectRatio } from "../models";
import Cropper from "cropperjs";

/**
 * The CropperService encapsulates the instance of Cropper (https://github.com/fengyuanchen/cropperjs)
 * and exposes crop-related methods used by the image editor.
 */
@Injectable()
export class CropperService {

    cropper: Cropper;

    /**
     * Enable the cropper. If this is the first call, the Cropper object will be instantiated.
     */
    enable(imageElement: HTMLImageElement, aspectRatio: AspectRatio): Promise<Cropper.ImageData> {
        if (!this.cropper) {
            return new Promise(resolve => {
                this.cropper = new Cropper(imageElement, {
                    viewMode: 1,
                    autoCrop: true,
                    zoomable: false,
                    ready: () => {
                        this.setCropAspectRatio(aspectRatio);
                        resolve(this.cropper.getImageData());
                    }
                });
            });
        } else {
            this.cropper.enable();
            return Promise.resolve(this.cropper.getImageData());
        }
    }

    /**
     * Disable the cropper.
     */
    disable(): void {
        this.cropper.disable();
    }

    /**
     * Set the aspect ratio of the crop box.
     */
    setCropAspectRatio(value: AspectRatio) {
        const imageData = this.cropper.getImageData();
        let aspectRatioNumber: number;
        switch (value) {
            case 'original':
                aspectRatioNumber = imageData.naturalWidth / imageData.naturalHeight;
                break;
            case 'square':
                aspectRatioNumber = 1;
                break;
            default:
                aspectRatioNumber = NaN;
                break;
        }
        this.cropper.setAspectRatio(aspectRatioNumber);
    }

    /**
     * Reset the crop box to the dimensions of the original image.
     */
    resetCrop(): void {
        const imageData = this.cropper.getImageData();
        this.setCropAspectRatio('original');
        this.cropper.setData({
            x: 0,
            y: 0,
            width: imageData.naturalWidth,
            height: imageData.naturalHeight
        });
    }
}