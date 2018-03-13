import {Component, ElementRef, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import Cropper from 'cropperjs';
import {ImagePreviewComponent} from "../image-preview/image-preview.component";

export type Mode = 'preview' | 'crop' | 'resize' | 'focalPoint';
export type AspectRatio = 'original' | 'square' | 'free';

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

    cropper: Cropper;
    mode: Mode = 'preview';
    cropAspectRatio: AspectRatio = 'original';
    previewWidth: number;
    previewHeight: number;
    private cropperData: Cropper.Data;

    ngAfterViewInit(): void {}

    setMode(modeClicked: Mode): void {
        if (this.mode !== modeClicked) {
            this.exitMode(this.mode);
            this.enterMode(modeClicked);
            this.mode = modeClicked;
        }
    }

    setCropAspectRatio(value: AspectRatio) {
        const imageData = this.cropper.getImageData();
        let aspectRatioNumber: number;
        switch (value) {
            case 'original':
                aspectRatioNumber = imageData.naturalWidth / imageData.naturalHeight;
                break;
            case 'square':
                aspectRatioNumber = 1;
                break;
            default:
                aspectRatioNumber = NaN;
                break;
        }
        this.cropper.setAspectRatio(aspectRatioNumber);
    }

    resetCrop(): void {
        const imageData = this.cropper.getImageData();
        this.cropAspectRatio = 'original';
        this.setCropAspectRatio('original');
        this.cropper.setData({
            x: 0,
            y: 0,
            width: imageData.naturalWidth,
            height: imageData.naturalHeight
        });
    }

    applyCrop(): void {
        this.cropperData = this.cropper.getData();
        this.imagePreview.recalculatePreview();
        this.setMode('preview');
    }

    cancelCrop(): void {
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
        if (!this.cropper) {
            this.cropper = new Cropper(this.sourceImage.nativeElement, {
                viewMode: 1,
                autoCrop: true,
                zoomable: false,
                ready: () => {
                    if (this.cropperData) {
                        this.cropper.setData(this.cropperData);
                    }
                    this.previewWidth = this.cropper.getImageData().naturalWidth;
                    this.previewHeight = this.cropper.getImageData().naturalHeight;
                    this.setCropAspectRatio(this.cropAspectRatio);
                }
            });
        } else {
            this.cropper.enable();
        }
    }

    private exitCropMode(): void {
        console.log(`exiting crop mode`);
        this.cropper.disable();
    }

    private enterResizeMode(): void {
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
