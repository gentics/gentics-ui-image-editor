import {CropRect, ImageTransformParams} from './models';

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
export function getDefaultCropRect(img: HTMLImageElement, params?: ImageTransformParams): CropRect {
    const cropRect = params && params.cropRect;
    return {
        startX: cropRect ? cropRect.startX : 0,
        startY: cropRect ? cropRect.startY : 0,
        width: cropRect ? cropRect.width : img ? img.naturalWidth : 0,
        height: cropRect ? cropRect.height : img ? img.naturalHeight : 0,
    };
}
