import {InjectionToken} from "@angular/core";

export type Mode = 'preview' | 'crop' | 'resize' | 'focalPoint';
export type AspectRatio = 'original' | 'square' | 'free';
export type Dimensions2D = { width: number; height: number; };

export const CropperConstructor = new InjectionToken<Cropper>('Cropper');
