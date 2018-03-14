import {Component, ElementRef, Input, ViewChild, ViewEncapsulation} from '@angular/core';

import { ImagePreviewComponent } from "../image-preview/image-preview.component";
import { AspectRatio, Mode } from "../../models";
import { CropperService } from "../../providers/cropper.service";
import { ResizeService } from "../../providers/resize.service";
import {getActualCroppedSize, getDefaultCropperData} from "../../utils";
import {Observable} from "rxjs/Observable";
import {map, tap} from "rxjs/operators";

@Component({
    selector: 'gentics-image-editor',
    templateUrl: './gentics-image-editor.component.html',
    styleUrls: ['./gentics-image-editor.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class GenticsImageEditorComponent {

    @Input() src: string;

    @ViewChild('sourceImage') sourceImage: ElementRef;
    @ViewChild(ImagePreviewComponent) imagePreview: ImagePreviewComponent;

    mode: Mode = 'preview';

    // crop-related state
    cropAspectRatio: AspectRatio = 'original';
    previewWidth: number;
    previewHeight: number;

    // resize-related state
    resizeScale = 1;
    resizeRangeValue = 0;
    resizeMin$: Observable<number>;
    resizeMax$: Observable<number>;
    resizeDimensions$: Observable<string>;

    constructor(private cropperService: CropperService,
                private resizeService: ResizeService) {}

    ngOnInit(): void {
        this.resizeMin$ = this.resizeService.min$;
        this.resizeMax$ = this.resizeService.max$;
        this.resizeDimensions$ = this.resizeService.resizeDimensions$.pipe(
            map(dimensions => `${dimensions.width}px x ${dimensions.height}px`));
    }

    setMode(modeClicked: Mode): void {
        if (this.mode !== modeClicked) {
            this.exitMode(this.mode);
            this.enterMode(modeClicked);
            this.mode = modeClicked;
        }
    }

    setCropAspectRatio(value: AspectRatio) {
        this.cropperService.setCropAspectRatio(value);
    }

    resetCrop(): void {
        this.cropAspectRatio = 'original';
        this.cropperService.resetCrop();
    }

    applyCrop(): void {
        this.imagePreview.updateCropperData(this.cropperService.cropperData);
        this.setMode('preview');
    }

    cancelCrop(): void {
        this.setMode('preview');
    }

    previewResize(width: number): void {
        this.resizeService.update(width);
        const scale = this.resizeService.getNormalizedScaleValue();
        this.imagePreview.updateScale(scale, scale);
    }

    applyResize(): void {
        const scale = this.resizeService.getNormalizedScaleValue();
        this.resizeScale = scale;
        this.imagePreview.updateScale(scale, scale);
        this.setMode('preview');
    }

    cancelResize(): void {
        this.imagePreview.updateScale(1, 1);
        this.setMode('preview');
    }

    private enterMode(mode: Mode): void {
        switch (mode) {
            case 'crop':
                this.enterCropMode();
                break;
            case 'resize':
                this.enterResizeMode();
                break;
            case 'focalPoint':
                this.enterFocalPointMode();
                break;
            default:
                this.enterPreviewMode();
        }
    }

    private exitMode(mode: Mode): void {
        switch (mode) {
            case 'crop':
                this.exitCropMode();
                break;
            case 'resize':
                this.exitResizeMode();
                break;
            case 'focalPoint':
                this.exitFocalPointMode();
                break;
            default:
                this.exitPreviewMode();
        }
    }

    private enterPreviewMode(): void {
        console.log(`entering preview mode`);
    }

    private exitPreviewMode(): void {
        console.log(`exiting preview mode`);
    }

    private enterCropMode(): void {
        console.log(`entering crop mode`);
        this.cropperService.enable(this.sourceImage.nativeElement, this.cropAspectRatio)
            .then(imageData => {
                this.previewWidth = imageData.naturalWidth;
                this.previewHeight = imageData.naturalHeight;
            });
    }

    private exitCropMode(): void {
        console.log(`exiting crop mode`);
        this.cropperService.disable();
    }

    private enterResizeMode(): void {
        let cropperData = this.cropperService.cropperData;
        if (!cropperData) {
            cropperData = getDefaultCropperData(this.sourceImage.nativeElement);
        }
        const { width, height } = getActualCroppedSize(cropperData);
        this.resizeService.enable(width, height, this.resizeScale);
        this.resizeRangeValue = width * this.resizeScale;
        console.log(`entering resize mode`);
    }

    private exitResizeMode(): void {
        console.log(`exiting resize mode`);
    }

    private enterFocalPointMode(): void {
        console.log(`entering focal point mode`);
    }

    private exitFocalPointMode(): void {
        console.log(`exiting focal point mode`);
    }
}
