import {CropperData} from './providers/cropper.service';

/**
 * Components with boolean inputs may receive the value as an actual boolean (if data-bound `[prop]="false"`) or as
 * a string representation of a boolean (if passed as a regular attribute `prop="false"`).
 * In the latter case, we want to ensure that the string version is correctly coerced to its boolean counterpart.
 */
export function coerceToBoolean(val: any): boolean {
    return val === true || val === 'true' || val === '';
}

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
