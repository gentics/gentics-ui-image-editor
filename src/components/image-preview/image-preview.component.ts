import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input, OnChanges, OnInit,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {DomSanitizer, SafeStyle} from '@angular/platform-browser';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {map, share} from 'rxjs/operators';
import {combineLatest} from 'rxjs/observable/combineLatest';

import {CropperData} from '../../providers/cropper.service';
import {getDefaultCropperData} from '../../utils';
import {Dimensions2D} from '../../models';

/**
 * An image preview component which accepts crop and scale data and renders the resulting
 * image with width and height scales.
 */
@Component({
    selector: 'gentics-image-preview',
    templateUrl: 'image-preview.component.html',
    styleUrls: ['image-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagePreviewComponent implements OnInit, OnChanges {
    @Input() src: string;
    @Input() maxHeight: number;
    @Input() scaleX: number;
    @Input() scaleY: number;
    @Input() cropperData: CropperData;
    @Output() imageLoad = new EventEmitter<void>();

    @ViewChild('previewImage') previewImage: ElementRef;

    margin = 50;
    previewWidth$: Observable<number>;
    previewHeight$: Observable<number>;
    previewImageTransform$: Observable<SafeStyle>;
    previewImageWidth$: Observable<number>;
    previewImageHeight$: Observable<number>;
    actualHeight$: Observable<number>;
    actualWidth$: Observable<number>;
    previewWidthIsLessThanActual$: Observable<boolean>;
    previewHeightIsLessThanActual$: Observable<boolean>;

    private cropperData$ = new Subject<CropperData>();
    private scaleX$ = new BehaviorSubject<number>(1);
    private scaleY$ = new BehaviorSubject<number>(1);
    private resize$ = new BehaviorSubject<void>(null);

    constructor(private sanitizer: DomSanitizer,
                private elementRef: ElementRef) {}

    ngOnInit(): void {
        const scale$ = combineLatest(this.scaleX$, this.scaleY$).pipe(map(([x, y]) => ({ x, y })));

        const actualDimensions$ = combineLatest(this.cropperData$, scale$).pipe(
            map(([cropperData, scale]) => {
                return {
                    width: cropperData.outputData.width * scale.x,
                    height: cropperData.outputData.height * scale.y
                };
            })
        );

        const cropBoxDimensions$ = this.cropperData$.pipe(
            map(({ cropBoxData }) => ({ width: cropBoxData.width, height: cropBoxData.height })));

        const scaledDimensions$ = combineLatest(cropBoxDimensions$, scale$).pipe(
            map(([dimensions, scale]) => ({
                width: dimensions.width * scale.x,
                height: dimensions.height * scale.y
            }))
        );

        const maxDimensions$ = combineLatest(
            actualDimensions$,
            this.resize$
        ).pipe(
            map(([actual]) => this.calculateMaxDimensions(actual))
        );

        const viewableDimensions$ = combineLatest(
            actualDimensions$,
            scaledDimensions$,
            maxDimensions$
        ).pipe(
            map(([actual, cropBox, max]) => this.calculateViewableDimensions(actual, cropBox, max)),
            share()
        );

        const ratioAndCropperData$ = combineLatest(
            viewableDimensions$.pipe(map(dimensions => dimensions.ratio)),
            this.cropperData$
        );

        this.previewWidth$ = viewableDimensions$.pipe(map(data => data.width * data.ratio));
        this.previewHeight$ = viewableDimensions$.pipe(map(data => data.height * data.ratio));
        this.actualWidth$ = actualDimensions$.pipe(map(dimensions => dimensions.width));
        this.actualHeight$ = actualDimensions$.pipe(map(dimensions => dimensions.height));

        this.previewImageHeight$ = combineLatest(ratioAndCropperData$, scale$).pipe(
            map(([[ratio, { imageData }], scale]) => imageData.height * ratio * scale.y));

        this.previewImageWidth$ = combineLatest(ratioAndCropperData$, scale$).pipe(
            map(([[ratio, { imageData }], scale]) => imageData.width * ratio * scale.x));

        this.previewImageTransform$ =  combineLatest(ratioAndCropperData$, scale$).pipe(
            map(([[ratio, cropperData], scale]) => this.calculateImageTransform(ratio, cropperData, scale))
        );

        this.previewWidthIsLessThanActual$ = combineLatest(
            this.previewWidth$,
            this.actualWidth$
        ).pipe(map(([previewWidth, actualWidth]) => previewWidth < actualWidth - 1));

        this.previewHeightIsLessThanActual$ = combineLatest(
            this.previewHeight$,
            this.actualHeight$
        ).pipe(map(([previewHeight, actualHeight]) => previewHeight < actualHeight - 1));

    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('maxHeight' in changes) {
            this.resizeHandler();
        }
        if ('scaleX' in changes) {
            this.scaleX$.next(this.scaleX);
        }
        if ('scaleY' in changes) {
            this.scaleY$.next(this.scaleY);
        }
        if ('cropperData' in changes) {
            this.cropperData$.next(this.cropperData);
        }
    }

    imageLoaded(): void {
        this.imageLoad.emit();
        const img = this.previewImage.nativeElement as HTMLImageElement;
        this.cropperData$.next(getDefaultCropperData(img));
    }

    @HostListener('window:resize')
    resizeHandler(): void {
        this.resize$.next(null);
    }

    private calculateViewableDimensions(actual: Dimensions2D, cropBox: Dimensions2D, max: Dimensions2D): Dimensions2D & { ratio: number } {
        let ratio = 1;
        let maxWidth = Math.min(max.width, actual.width);
        let workingWidth = cropBox.width;
        let workingHeight = cropBox.height;

        if (maxWidth < workingWidth) {
            ratio = maxWidth / workingWidth;
        }
        if (workingWidth < actual.width) {
            if (maxWidth < actual.width) {
                ratio = maxWidth / workingWidth;
            } else {
                ratio = actual.width / workingWidth;
            }
        }
        return {
            width: workingWidth,
            height: workingHeight,
            ratio
        };
    }

    private calculateImageTransform(ratio: number, cropperData: CropperData, scale: { x: number; y: number; }): SafeStyle {
        const { cropBoxData, canvasData, imageData } = cropperData;
        const left = (cropBoxData.left - canvasData.left - imageData.left) * scale.x;
        const top = (cropBoxData.top - canvasData.top - imageData.top) * scale.y;

        return this.sanitizer
            .bypassSecurityTrustStyle(`translateX(-${Math.round(left * ratio)}px) translateY(-${Math.round(top * ratio)}px)`);
    }

    private calculateMaxDimensions(imageDimensions: Dimensions2D): Dimensions2D {
        const availableWidth = this.elementRef.nativeElement.offsetWidth - 3 * this.margin;
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
