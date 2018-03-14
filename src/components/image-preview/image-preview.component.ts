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

    private cropperData$ = new Subject<CropperData>();
    private maxDimensions$ = new Subject<Dimensions2D>();
    private scaleX$ = new BehaviorSubject<number>(1);
    private scaleY$ = new BehaviorSubject<number>(1);

    constructor(private sanitizer: DomSanitizer,
                private elementRef: ElementRef) {}

    ngOnInit(): void {

        const cropBoxDimensions$ = this.cropperData$.pipe(
            map(({ cropBoxData }) => this.calculateCropBoxDimensions(cropBoxData))
        );

        const viewableDimensions$ = combineLatest(
            cropBoxDimensions$,
            this.maxDimensions$
        )
            .pipe(
                map(([cropBox, maxDimension]) => {
                    let ratio = 1;
                    if (maxDimension.width < cropBox.width) {
                        ratio = maxDimension.width / cropBox.width;
                    }
                    return {
                        width: cropBox.width,
                        height: cropBox.height,
                        ratio
                    };
                })
            );

        const ratioAndCropperData$ = combineLatest(
            viewableDimensions$.pipe(map(dimensions => dimensions.ratio)),
            this.cropperData$
        );

        this.previewWidth$ = viewableDimensions$.map(data => data.width * data.ratio);
        this.previewHeight$ = viewableDimensions$.map(data => data.height * data.ratio);

        this.previewImageHeight$ = ratioAndCropperData$.pipe(
            map(([ratio, { imageData }]) => imageData.height * ratio));

        this.previewImageWidth$ = ratioAndCropperData$.pipe(
            map(([ratio, { imageData }]) => imageData.width * ratio));

        this.previewImageTransform$ =  ratioAndCropperData$.pipe(
            map(([ratio, cropperData]) => this.calculateImageTransform(ratio, cropperData))
        );

        this.actualWidth$ = combineLatest(
            this.cropperData$,
            this.scaleX$
        ).pipe(
            map(([cropperData, scaleX]) =>
                Math.round(getActualCroppedSize(cropperData).width * scaleX))
        );

        this.actualHeight$ = combineLatest(
            this.cropperData$,
            this.scaleY$
        ).pipe(
            map(([cropperData, scaleY]) =>
                Math.round(getActualCroppedSize(cropperData).height * scaleY))
        );
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
