import {Inject, Injectable, Type} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {map} from "rxjs/operators";

import {AspectRatio, CropperConstructor} from "../models";

export type CropperData = {
    imageData: Cropper.ImageData;
    cropBoxData: Cropper.CropBoxData;
    canvasData: Cropper.CanvasData;
};

/**
 * The CropperService encapsulates the instance of Cropper (https://github.com/fengyuanchen/cropperjs)
 * and exposes crop-related methods used by the image editor.
 */
@Injectable()
export class CropperService {

    cropBoxMatchesImage$: Observable<boolean>;

    private resizing = false;
    private cropper: Cropper;
    private lastImageSrc: string;
    private lastData: Cropper.Data;
    private resizeTimer: number;
    private crop$ = new Subject<Cropper.Data>();

    constructor(@Inject(CropperConstructor) private cropperConstructor: Type<Cropper>) {
        this.cropBoxMatchesImage$ = this.crop$.pipe(
            map(cropperData => {
                const imageData = this.cropper.getImageData();
                return Math.round(cropperData.width) === Math.round(imageData.naturalWidth) &&
                    Math.round(cropperData.height) === Math.round(imageData.naturalHeight);
            })
        );
    }

    /**
     * Returns a CropperData object
     */
    get cropperData(): CropperData | undefined {
        if (this.cropper) {
            const imageData = this.cropper.getImageData();
            const cropBoxData = this.cropper.getCropBoxData();
            const canvasData = this.cropper.getCanvasData();
            return {
                imageData,
                cropBoxData,
                canvasData
            };
        }
    }

    /**
     * Re-renders the cropper image and restores the cropBox position.
     */
    resizeHandler(debounceDelay, onComplete?: () => void): void {
        if (this.lastData && this.cropper) {
            const data = this.lastData;
            this.resizing = true;
            clearTimeout(this.resizeTimer);
            this.resizeTimer = setTimeout(() => {
                (this.cropper as any).resize();
                this.cropper.reset();
                this.cropper.setData(data);
                this.resizing = false;
                if (typeof onComplete === 'function') {
                    onComplete();
                }
            }, debounceDelay);
        }
    }

    /**
     * Enable the cropper. If this is the first call, the Cropper object will be instantiated.
     */
    enable(imageElement: HTMLImageElement, aspectRatio: AspectRatio): Promise<Cropper.ImageData> {
        if (this.lastImageSrc !== imageElement.src && this.cropper) {
            this.cropper.destroy();
            this.cropper = undefined;
        }

        if (!this.cropper) {
            this.lastImageSrc = imageElement.src;
            return new Promise(resolve => {
                this.cropper = new this.cropperConstructor(imageElement, {
                    viewMode: 1,
                    autoCrop: true,
                    zoomable: false,
                    responsive: true,
                    ready: () => {
                        this.setCropAspectRatio(aspectRatio);
                        resolve(this.cropper.getImageData());
                    },
                    crop: data => {
                        if (!this.resizing) {
                            this.lastData = data.detail;
                            this.crop$.next(data.detail);
                        }
                    }
                });
            });
        } else {
            this.cropper.enable();
            this.resizeHandler(0);
            return Promise.resolve(this.cropper.getImageData());
        }
    }

    /**
     * Disable the cropper.
     */
    disable(): void {
        if (this.cropper) {
            this.cropper.disable();
        }
    }

    /**
     * Set the aspect ratio of the crop box.
     */
    setCropAspectRatio(value: AspectRatio) {
        if (this.cropper) {
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
    }

    /**
     * Reset the crop box to the dimensions of the original image.
     */
    resetCrop(): void {
        if (this.cropper) {
            // setTimeout is required because if the aspect ratio is also changed,
            // then the dimensions of the cropBox will be reset to the default autoCropArea (80% of image size)
            setTimeout(() => {
                const imageData = this.cropper.getImageData();
                this.cropper.setData({
                    x: 0,
                    y: 0,
                    width: imageData.naturalWidth,
                    height: imageData.naturalHeight
                });
            });
        }
    }
}