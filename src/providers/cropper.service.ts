import {Inject, Injectable, OnDestroy, Type} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {map} from 'rxjs/operators';

import {AspectRatio, CropperConstructor, CropRect} from '../models';

/**
 * The CropperService encapsulates the instance of Cropper (https://github.com/fengyuanchen/cropperjs)
 * and exposes crop-related methods used by the image editor.
 */
@Injectable()
export class CropperService implements OnDestroy {

    cropBoxMatchesImage$: Observable<boolean>;

    private resizing = false;
    private cropper: Cropper;
    private lastImageSrc: string;
    private initialData: Cropper.Data;
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

    ngOnDestroy(): void {
       this.destroy();
    }

    /**
     * Returns a CropperData object
     */
    get cropRect(): CropRect | undefined {
        if (this.cropper) {
            const data = this.cropper.getData();
            return {
                startX: data.x,
                startY: data.y,
                width: data.width,
                height: data.height
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
        } else if (typeof onComplete === 'function') {
            onComplete();
        }
    }

    /**
     * Enable the cropper. If this is the first call, the Cropper object will be instantiated.
     */
    enable(imageElement: HTMLImageElement, aspectRatio: AspectRatio): Promise<void> {
        if (this.lastImageSrc !== imageElement.src) {
            this.destroy();
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
                        if (this.initialData) {
                            this.cropper.setData(this.initialData);
                        }
                        this.setCropAspectRatio(aspectRatio);
                        resolve();
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
            return Promise.resolve();
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
     * Destroy the Cropperjs instance
     */
    destroy(): void {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
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
     * Set the cropper data
     */
    setCropData(data: Partial<Cropper.Data>): void {
        this.lastData = { ...this.lastData, ...data };
        if (this.cropper) {
            this.cropper.setData(data);
        } else {
            this.initialData = { ...this.lastData, ...data };
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
