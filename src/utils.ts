import {CropperData} from "./providers/cropper.service";
import {Dimensions2D} from "./models";

/**
 * Returns the actual physical dimensions of a cropped image.
 */
export function getActualCroppedSize(cropperData: CropperData): Dimensions2D {
    const { imageData, cropBoxData } = cropperData;
    return {
        width: (imageData.naturalWidth / imageData.width) * cropBoxData.width,
        height: (imageData.naturalHeight / imageData.height) * cropBoxData.height
    };
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
        }
    };
}
