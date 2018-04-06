import {ImageTransformParams} from './models';

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
export function getDefaultCropperData(img: HTMLImageElement, params?: ImageTransformParams): Cropper.Data {
    const cropRect = params && params.cropRect;
    return {
        x: cropRect ? cropRect.startX : 0,
        y: cropRect ? cropRect.startY : 0,
        width: cropRect ? cropRect.width : img.naturalWidth,
        height: cropRect ? cropRect.height : img.naturalHeight,
        rotate: 0,
        scaleX: 1,
        scaleY: 1
    };
}
