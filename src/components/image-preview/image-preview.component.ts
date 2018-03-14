import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
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
    @Input() width: number;
    @Input() height: number;
    @Input() visible: boolean = true;

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
    private maxDimensions$ = new Subject<Dimensions2D>();
    private scaleX$ = new BehaviorSubject<number>(1);
    private scaleY$ = new BehaviorSubject<number>(1);

    constructor(private sanitizer: DomSanitizer,
                private elementRef: ElementRef) {}

    ngOnInit(): void {

        const actualDimensions$ = combineLatest(
            this.cropperData$,
            this.scaleX$,
            this.scaleY$
        ).pipe(
            map(([cropperData, scaleX, scaleY]) => {
                return {
                    width: Math.round(getActualCroppedSize(cropperData).width * scaleX),
                    height: Math.round(getActualCroppedSize(cropperData).height * scaleY)
                };
            })
        );

        const cropBoxDimensions$ = this.cropperData$.pipe(
            map(({ cropBoxData }) => this.calculateCropBoxDimensions(cropBoxData)));

        const viewableDimensions$ = combineLatest(
            actualDimensions$,
            cropBoxDimensions$,
            this.maxDimensions$
        ).pipe(
            map(([actual, cropBox, max]) => this.calculateViewableDimensions(actual, cropBox, max))
        );

        const ratioAndCropperData$ = combineLatest(
            viewableDimensions$.pipe(map(dimensions => dimensions.ratio)),
            this.cropperData$
        );

        this.previewWidth$ = viewableDimensions$.map(data => data.width * data.ratio);
        this.previewHeight$ = viewableDimensions$.map(data => data.height * data.ratio);
        this.actualWidth$ = actualDimensions$.pipe(map(dimensions => dimensions.width));
        this.actualHeight$ = actualDimensions$.pipe(map(dimensions => dimensions.height));

        this.previewImageHeight$ = ratioAndCropperData$.pipe(
            map(([ratio, { imageData }]) => imageData.height * ratio));

        this.previewImageWidth$ = ratioAndCropperData$.pipe(
            map(([ratio, { imageData }]) => imageData.width * ratio));

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

    imageLoaded(): void {
        const img = this.previewImage.nativeElement as HTMLImageElement;
        this.cropperData$.next(getDefaultCropperData(img));
        this.calculateMaxDimensions(img);
    }

    @HostListener('window:resize')
    resizeHandler(): void {
        const img = this.previewImage.nativeElement as HTMLImageElement;
        this.calculateMaxDimensions(img);
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
        if (maxWidth < cropBox.width) {
            ratio = maxWidth / cropBox.width;
        }

        return {
            width: cropBox.width,
            height: cropBox.height,
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
            .bypassSecurityTrustStyle(`translateX(-${left * ratio}px) translateY(-${top * ratio}px)`);
    }

    private calculateMaxDimensions(img: HTMLImageElement): void {
        const availableWidth = this.elementRef.nativeElement.offsetWidth - 3 * this.margin;
        let ratio = 1;
        if (availableWidth < img.naturalWidth) {
            ratio = availableWidth / img.naturalWidth;
        }
        const width = img.naturalWidth * ratio;
        const height = img.naturalHeight * ratio;
        this.maxDimensions$.next({ width, height });
    }
}
