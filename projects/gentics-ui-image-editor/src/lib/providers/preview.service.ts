import {Injectable} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Observable, combineLatest, Subject, BehaviorSubject} from 'rxjs';
import {delay, map, share} from 'rxjs/operators';

import {CropRect, Dimensions2D} from '../models';
import {getDefaultCropRect} from '../utils';

/**
 * The ImagePreviewService encapsulates the calculation logic for the preview image, and allows this logic to be shared between the
 * stand-alone GenticsImagePreviewComponent and the ImagePreviewWithScalesComponent.
 *
 * @example
 * ```
 * ngOnInit(): void {
 *   this.previewService.registerContainer(this.elementRef.nativeElement, this.maxHeight, this.margin);
 * }
 *
 * onImageLoad(img: HTMLImageElement): void {
 *   this.previewService.registerImage(img);
 * }
 * ```
 */
@Injectable()
export class ImagePreviewService {

    previewWidth$: Observable<number>;
    previewHeight$: Observable<number>;
    previewImageTransform$: Observable<SafeStyle>;
    previewImageWidth$: Observable<number>;
    previewImageHeight$: Observable<number>;
    actualHeight$: Observable<number>;
    actualWidth$: Observable<number>;
    previewWidthIsLessThanActual$: Observable<boolean>;
    previewHeightIsLessThanActual$: Observable<boolean>;

    private imageNaturalDimensions$ = new BehaviorSubject<Dimensions2D>({ width: 0, height: 0 });
    private scaleX$ = new Subject<number>();
    private scaleY$ = new Subject<number>();
    private cropRect$ = new Subject<CropRect>();
    private resize$ = new Subject<void>();
    private container: HTMLElement;
    private maxHeight = 0;
    private margin = 0;

    constructor(private sanitizer: DomSanitizer) {}

    /**
     * Sets the container of the image preview, which is used to calculate the maximum dimensions of the preview.
     */
    registerContainer(container: HTMLElement, maxHeight: number, margin: number = 0): void {
        this.container = container;
        this.maxHeight = maxHeight;
        this.margin = margin;

        const scale$ = combineLatest(this.scaleX$, this.scaleY$).pipe(map(([x, y]) => ({ x, y })));

        const actualDimensions$ = combineLatest(this.cropRect$, scale$).pipe(
            map(([cropRect, scale]) => ({
                    width: cropRect.width * scale.x,
                    height: cropRect.height * scale.y
                })
            ),
            share()
        );

        const maxDimensions$ = combineLatest(actualDimensions$, this.resize$).pipe(
            // Delay the calculation to give time for the containing DOM to update
            delay(1),
            map(([actual]) => this.calculateMaxDimensions(actual))
        );

        const previewRatio$ = combineLatest(actualDimensions$, maxDimensions$).pipe(
            map(([actual, max]) => this.calculatePreviewRatio(actual, max)),
            share()
        );

        this.previewWidth$ = combineLatest(actualDimensions$, previewRatio$).pipe(map(([actual, ratio]) => actual.width * ratio));
        this.previewHeight$ = combineLatest(actualDimensions$, previewRatio$).pipe(map(([actual, ratio]) => actual.height * ratio));
        this.actualWidth$ = actualDimensions$.pipe(map(actual => actual.width));
        this.actualHeight$ = actualDimensions$.pipe(map(actual => actual.height));

        this.previewImageHeight$ = combineLatest(previewRatio$, this.imageNaturalDimensions$, scale$).pipe(
            map(([ratio, natural, scale]) => natural.height * ratio * scale.y));

        this.previewImageWidth$ = combineLatest(previewRatio$, this.imageNaturalDimensions$, scale$).pipe(
            map(([ratio, natural, scale]) => natural.width * ratio * scale.x));

        this.previewImageTransform$ = combineLatest(previewRatio$, this.cropRect$, scale$).pipe(
            map(([ratio, cropRect, scale]) => this.calculateImageTransform(ratio, cropRect, scale)));

        this.previewWidthIsLessThanActual$ = combineLatest(
            this.previewWidth$,
            this.actualWidth$
        ).pipe(map(([previewWidth, actualWidth]) => previewWidth < actualWidth - 1));

        this.previewHeightIsLessThanActual$ = combineLatest(
            this.previewHeight$,
            this.actualHeight$
        ).pipe(map(([previewHeight, actualHeight]) => previewHeight < actualHeight - 1));
    }

    /**
     * Once the preview image has loaded, it can be registered so that this service knows the natural dimensions of the source image.
     */
    registerImage(img: HTMLImageElement): void {
        this.cropRect$.next(getDefaultCropRect(img));
        this.scaleX$.next(1);
        this.scaleY$.next(1);
        this.resize$.next();
        this.imageNaturalDimensions$.next({ width: img.naturalWidth, height: img.naturalHeight });
    }

    resize(): void {
        this.resize$.next();
    }

    setScaleX(value: number): void {
        this.scaleX$.next(value);
    }

    setScaleY(value: number): void {
        this.scaleY$.next(value);
    }

    setCropRect(value: CropRect): void {
        this.cropRect$.next(value);
    }

    private calculatePreviewRatio(actual: Dimensions2D, max: Dimensions2D): number {
        const maxWidth = Math.min(max.width, actual.width);
        let ratio = 1;
        if (maxWidth < actual.width) {
            ratio = maxWidth / actual.width;
        }
        return ratio;
    }

    private calculateImageTransform(ratio: number, cropRect: CropRect, scale: { x: number; y: number; }): SafeStyle {
        const left = Math.round(cropRect.startX * scale.x * ratio);
        const top = Math.round(cropRect.startY * scale.y * ratio);

        return this.sanitizer.bypassSecurityTrustStyle(`translateX(-${left}px) translateY(-${top}px)`);
    }

    private calculateMaxDimensions(imageDimensions: Dimensions2D): Dimensions2D {
        const availableWidth = this.container.offsetWidth - 3 * this.margin;
        const availableHeight = this.calculateMaxHeight();
        const scaledImageWidth = imageDimensions.width;
        const scaledImageHeight = imageDimensions.height;

        let ratio = 1;
        if (availableWidth < scaledImageWidth) {
            ratio = availableWidth / scaledImageWidth;
        }
        if (availableHeight < scaledImageHeight * ratio) {
            ratio = availableHeight / scaledImageHeight;
        }
        const width = scaledImageWidth * ratio;
        const height = scaledImageHeight * ratio;
        return { width, height };
    }

    private calculateMaxHeight(): number {
        return Math.max(this.maxHeight - 2 * this.margin, 3 * this.margin);
    }
}
