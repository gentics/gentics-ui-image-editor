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

export type AspectRatioType = {
    display?: 'radio' | 'select';
    label?: string;
}

export type AspectRatioOriginal = { kind: 'original' } & AspectRatioType;
export type AspectRatioSquare = { kind: 'square' } & AspectRatioType;
export type AspectRatioFree = { kind: 'free' } & AspectRatioType;
export type AspectRatioDimensions2D = { kind: 'dimensions' } & Dimensions2D & AspectRatioType;

export enum AspectRatios {
    Original = 'original',
    Square = 'square',
    Free = 'free',
    Dimensions = 'dimensions'
}

export const AspectRatio = new Map<string, AspectRatio>([
    [AspectRatios.Original, { kind: 'original', display: 'radio', label: 'aspect_ratio_original' }],
    [AspectRatios.Square, { kind: 'square', display: 'radio', label: 'aspect_ratio_square' }],
    [AspectRatios.Free, { kind: 'free', display: 'radio', label: 'aspect_ratio_free' }]
]);
