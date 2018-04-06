import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
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
    @Input() cropperData: Cropper.Data;
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

    private cropperData$ = new Subject<Cropper.Data>();
    private scaleX$ = new BehaviorSubject<number>(1);
    private scaleY$ = new BehaviorSubject<number>(1);
    private resize$ = new BehaviorSubject<void>(null);
    private imageNaturalDimensions$ = new BehaviorSubject<Dimensions2D>({ width: 0, height: 0 });

    constructor(private sanitizer: DomSanitizer,
                private elementRef: ElementRef) {}

    ngOnInit(): void {
        const scale$ = combineLatest(this.scaleX$, this.scaleY$).pipe(map(([x, y]) => ({ x, y })));

        const actualDimensions$ = combineLatest(this.cropperData$, scale$).pipe(
            map(([cropperData, scale]) => ({
                    width: cropperData.width * scale.x,
                    height: cropperData.height * scale.y
                })
            ),
            share()
        );

        const maxDimensions$ = combineLatest(actualDimensions$, this.resize$).pipe(
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

        this.previewImageTransform$ = combineLatest(previewRatio$, this.cropperData$, scale$).pipe(
            map(([ratio, cropperData, scale]) => this.calculateImageTransform(ratio, cropperData, scale)));

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
        this.imageNaturalDimensions$.next({ width: img.naturalWidth, height: img.naturalHeight });
    }

    @HostListener('window:resize')
    resizeHandler(): void {
        this.resize$.next(null);
    }

    private calculatePreviewRatio(actual: Dimensions2D, max: Dimensions2D): number {
        const maxWidth = Math.min(max.width, actual.width);
        let ratio = 1;
        if (maxWidth < actual.width) {
            ratio = maxWidth / actual.width;
        }
        return ratio;
    }

    private calculateImageTransform(ratio: number, cropperData: Cropper.Data, scale: { x: number; y: number; }): SafeStyle {
        const left = Math.round(cropperData.x * scale.x * ratio);
        const top = Math.round(cropperData.y * scale.y * ratio);

        return this.sanitizer.bypassSecurityTrustStyle(`translateX(-${left}px) translateY(-${top}px)`);
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
