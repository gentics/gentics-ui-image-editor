import {InjectionToken} from '@angular/core';
import Cropper from 'cropperjs';

export type Mode = 'preview' | 'crop' | 'resize' | 'focalPoint';
export type AspectRatio = 'original' | 'square' | 'free';
export type Dimensions2D = { width: number; height: number; };

export const CropperConstructor = new InjectionToken<Cropper>('Cropper');

export type ImageTransformParams = {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    cropRect: {
        startX: number;
        startY: number;
        width: number;
        height: number;
    };
    focalPointX: number;
    focalPointY: number;
};
