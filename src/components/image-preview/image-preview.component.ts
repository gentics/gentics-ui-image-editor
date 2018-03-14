import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    HostBinding,
    HostListener,
    Input,
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";
import {Observable} from "rxjs/Observable";
import {Subject} from "rxjs/Subject";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {map} from "rxjs/operators";
import {combineLatest} from "rxjs/observable/combineLatest";

export type CropperData = {
    imageData: Cropper.ImageData;
    cropBoxData: Cropper.CropBoxData;
    canvasData: Cropper.CanvasData;
};

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
    @Input() scaleX: number = 1;
    @Input() scaleY: number = 1;

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
    private maxDimensions$ = new Subject<{ width: number; height: number; }>();
    private scaleX$ = new BehaviorSubject<number>(1);
    private scaleY$ = new BehaviorSubject<number>(1);

    constructor(private sanitizer: DomSanitizer,
                private elementRef: ElementRef) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['scaleX']) {
            this.scaleX$.next(this.scaleX);
        }
        if (changes['scaleY']) {
            this.scaleY$.next(this.scaleY);
        }
    }

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
            map(([{ imageData, cropBoxData }, scaleX]) =>
                Math.round((imageData.naturalWidth / imageData.width) * cropBoxData.width * scaleX))
        );

        this.actualHeight$ = combineLatest(
            this.cropperData$,
            this.scaleY$
        ).pipe(
            map(([{ imageData, cropBoxData }, scaleY]) =>
                Math.round((imageData.naturalHeight / imageData.height) * cropBoxData.height * scaleY))
        );
    }

    imageLoaded(): void {
        const img = this.previewImage.nativeElement as HTMLImageElement;
        this.cropperData$.next(this.getDefaultCropperData(img));
        this.calculateMaxDimensions(img);
    }

    @HostListener('window:resize')
    resizeHandler(): void {
        const img = this.previewImage.nativeElement as HTMLImageElement;
        this.calculateMaxDimensions(img);
    }

    updateCropperData(cropper: Cropper): void {
        const imageData = cropper.getImageData();
        const cropBoxData = cropper.getCropBoxData();
        const canvasData = cropper.getCanvasData();
        this.cropperData$.next({
            imageData,
            cropBoxData,
            canvasData
        });
    }

    private calculateCropBoxDimensions(cropBoxData: Cropper.CropBoxData): { width: number; height: number; } {
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

    private getDefaultCropperData(img: HTMLImageElement): CropperData {
        const height = img.naturalHeight;
        const width = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        const naturalWidth = img.naturalWidth;
        const top = 0;
        const left = 0;

        return {
            canvasData: {
                height,
                width,
                naturalHeight,
                naturalWidth,
                left,
                top,
            },
            cropBoxData: {
                width,
                height,
                left,
                top,
            },
            imageData: {
                naturalWidth,
                naturalHeight,
                width,
                height,
                left,
                top,
                aspectRatio: NaN,
                scaleX: 1,
                scaleY: 1,
                rotate: 0
            }
        };
    }
}
