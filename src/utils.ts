import {CropperData} from './providers/cropper.service';

/**
 * Returns a CropperData object with default values based on the natural dimensions of
 * the supplied image element.
 */
export function getDefaultCropperData(img: HTMLImageElement): CropperData {
    const height = img.naturalHeight;
    const width = img.naturalWidth;
    const naturalHeight = img.naturalHeight;
    const naturalWidth = img.naturalWidth;
    const top = 0;
    const left = 0;

    return {
        canvasData: {
            height,
            width,
            naturalHeight,
            naturalWidth,
            left,
            top,
        },
        cropBoxData: {
            width,
            height,
            left,
            top,
        },
        imageData: {
            naturalWidth,
            naturalHeight,
            width,
            height,
            left,
            top,
            aspectRatio: NaN,
            scaleX: 1,
            scaleY: 1,
            rotate: 0
        },
        outputData: {
            x: 0,
            y: 0,
            rotate: 0,
            width,
            height,
            scaleX: 1,
            scaleY: 1
        }
    };
}
