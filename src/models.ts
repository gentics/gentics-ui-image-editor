import {InjectionToken} from '@angular/core';
import Cropper from 'cropperjs';

export type Mode = 'preview' | 'crop' | 'resize' | 'focalPoint';
export type AspectRatio = AspectRatioOriginal | AspectRatioSquare | AspectRatioFree | AspectRatioDimensions2D;
export type Dimensions2D = { width: number; height: number; };

export const CropperConstructor = new InjectionToken<Cropper>('Cropper');

export type CropRect = {
    startX: number;
    startY: number;
    width: number;
    height: number;
};

export type ImageTransformParams = {
    width: number;
    height: number;
    scaleX: number;
    scaleY: number;
    cropRect: CropRect;
    focalPointX: number;
    focalPointY: number;
};

export type AspectRatioOriginal = { kind: 'original' };
export type AspectRatioSquare = { kind: 'square' }
export type AspectRatioFree = { kind: 'free' }

export type AspectRatioDimensions2D = {
    kind: 'dimensions';
    width: number;
    height: number;
}

export enum AspectRatios {
    Original = 'original',
    Square = 'square',
    Free = 'free',
    Dimensions = 'dimensions'
}

export const AspectRatio = new Map<string, AspectRatio>([
    [AspectRatios.Original, { kind: 'original' }],
    [AspectRatios.Square, { kind: 'square' }],
    [AspectRatios.Free, { kind: 'free' }]
]);