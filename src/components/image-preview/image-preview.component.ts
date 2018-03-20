import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostBinding,
    HostListener,
    Input,
    Output,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";

import {CropperData} from "../../providers/cropper.service";
import {getActualCroppedSize, getDefaultCropperData} from "../../utils";
import {Dimensions2D} from "../../models";

@Component({
    selector: 'gentics-image-preview',
    templateUrl: 'image-preview.component.html',
    styleUrls: ['image-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImagePreviewComponent {
    @Input() src: string;
    @Input() visible: boolean = true;
    @Input() maxHeight: number;
    @Output() imageLoad = new EventEmitter<void>();

    @HostBinding('class.hidden') get hidden(): boolean {
        return !this.visible;
    };

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

        const round = (value: number): number => Math.round(value);

        const actualDimensions$ = combineLatest(
            this.cropperData$,
            this.scaleX$,
            this.scaleY$
        ).pipe(
            map(([cropperData, scaleX, scaleY]) => {
                return {
                    width: round(getActualCroppedSize(cropperData).width * scaleX),
                    height: round(getActualCroppedSize(cropperData).height * scaleY)
                };
            })
        );

        const cropBoxDimensions$ = this.cropperData$.pipe(
            map(({ cropBoxData }) => this.calculateCropBoxDimensions(cropBoxData)));

        const maxDimensions$ = combineLatest(
            actualDimensions$,
            this.resize$
        ).pipe(
            map(([actual]) => {
                return this.calculateMaxDimensions(actual);
            })
        );

        const viewableDimensions$ = combineLatest(
            actualDimensions$,
            cropBoxDimensions$,
            maxDimensions$
        ).pipe(
            map(([actual, cropBox, max]) => this.calculateViewableDimensions(actual, cropBox, max))
        );

        const ratioAndCropperData$ = combineLatest(
            viewableDimensions$.pipe(map(dimensions => dimensions.ratio)),
            this.cropperData$
        );

        this.previewWidth$ = viewableDimensions$.pipe(map(data => round(data.width * data.ratio)));
        this.previewHeight$ = viewableDimensions$.pipe(map(data => round(data.height * data.ratio)));
        this.actualWidth$ = actualDimensions$.pipe(map(dimensions => round(dimensions.width)));
        this.actualHeight$ = actualDimensions$.pipe(map(dimensions => round(dimensions.height)));

        this.previewImageHeight$ = ratioAndCropperData$.pipe(
            map(([ratio, { imageData }]) => round(imageData.height * ratio)));

        this.previewImageWidth$ = ratioAndCropperData$.pipe(
            map(([ratio, { imageData }]) => round(imageData.width * ratio)));

        this.previewImageTransform$ =  ratioAndCropperData$.pipe(
            map(([ratio, cropperData]) => this.calculateImageTransform(ratio, cropperData))
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

    updateCropperData(cropperData: CropperData): void {
        this.cropperData$.next(cropperData);
    }

    updateScale(scaleX: number, scaleY: number): void {
        this.scaleX$.next(scaleX);
        this.scaleY$.next(scaleY);
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

    private calculateCropBoxDimensions(cropBoxData: Cropper.CropBoxData): Dimensions2D {
        const { width: cropBoxWidth, height: cropBoxHeight } = cropBoxData;
        const originalWidth = cropBoxData.width;
        const originalHeight = cropBoxData.height;
        let newWidth = originalWidth;
        let newHeight = originalHeight;

        if (cropBoxWidth) {
            const ratio = originalWidth / cropBoxWidth;
            newHeight = cropBoxHeight * ratio;
        }

        if (cropBoxHeight && newHeight > originalHeight) {
            const ratio = originalHeight / cropBoxHeight;
            newWidth = cropBoxWidth * ratio;
            newHeight = originalHeight;
        }

        return {
            width: newWidth,
            height: newHeight
        };
    }

    private calculateImageTransform(ratio: number, cropperData: CropperData): SafeStyle {
        const { cropBoxData, canvasData, imageData } = cropperData;
        const left = cropBoxData.left - canvasData.left - imageData.left;
        const top = cropBoxData.top - canvasData.top - imageData.top;

        return this.sanitizer
            .bypassSecurityTrustStyle(`translateX(-${Math.round(left * ratio)}px) translateY(-${Math.round(top * ratio)}px)`);
    }

    private calculateMaxDimensions(imageDimensions: Dimensions2D): Dimensions2D {
        const availableWidth = this.elementRef.nativeElement.offsetWidth - 3 * this.margin;
        const availableHeight = this.calculateMaxHeight();

        let ratio = 1;
        if (availableWidth < imageDimensions.width) {
            ratio = availableWidth / imageDimensions.width;
        }
        if (availableHeight < imageDimensions.height * ratio) {
            ratio = availableHeight / imageDimensions.height;
        }
        const width = imageDimensions.width * ratio;
        const height = imageDimensions.height * ratio;
        return { width, height };
    }

    private calculateMaxHeight(): number {
        return Math.max(this.maxHeight - 2 * this.margin, 3 * this.margin);
    }
}
