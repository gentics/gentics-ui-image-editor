import {Component, ElementRef, Input, ViewChild, ViewEncapsulation} from '@angular/core';

import { ImagePreviewComponent } from "../image-preview/image-preview.component";
import { AspectRatio, Mode } from "../../models";
import { CropperService } from "../../providers/cropper.service";

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
    cropAspectRatio: AspectRatio = 'original';
    previewWidth: number;
    previewHeight: number;

    constructor(private cropperService: CropperService) {}

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
        this.imagePreview.recalculatePreview(this.cropperService.cropper);
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
