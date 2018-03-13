import {Component, ElementRef, Input, ViewChild} from '@angular/core';
import {DomSanitizer, SafeStyle} from "@angular/platform-browser";

@Component({
    selector: 'gentics-image-preview',
    templateUrl: 'image-preview.component.html',
    styleUrls: ['image-preview.component.scss']
})
export class ImagePreviewComponent {
    @Input() src: string;
    @Input() cropper: Cropper;
    @Input() width: number;
    @Input() height: number;

    @ViewChild('previewImage') previewImage: ElementRef;

    cropBoxWidth: number;
    cropBoxHeight: number;
    previewImageTransform: SafeStyle = 'none';
    previewImageWidth: number;
    previewImageHeight: number;

    constructor(private sanitizer: DomSanitizer) {}

    recalculatePreview(): void {
        const imageData = this.cropper.getImageData();
        const cropBoxData = this.cropper.getCropBoxData();
        const canvasData = this.cropper.getCanvasData();
        const { width: cropBoxWidth, height: cropBoxHeight } = cropBoxData;
        const left = cropBoxData.left - canvasData.left - imageData.left;
        const top = cropBoxData.top - canvasData.top - imageData.top;
        const originalWidth = cropBoxData.width;
        const originalHeight = cropBoxData.height;
        let newWidth = originalWidth;
        let newHeight = originalHeight;
        let ratio = 1;

        if (cropBoxWidth) {
            ratio = originalWidth / cropBoxWidth;
            newHeight = cropBoxHeight * ratio;
        }

        if (cropBoxHeight && newHeight > originalHeight) {
            ratio = originalHeight / cropBoxHeight;
            newWidth = cropBoxWidth * ratio;
            newHeight = originalHeight;
        }

        this.cropBoxHeight = newHeight;
        this.cropBoxWidth = newWidth;
        this.previewImageWidth = imageData.width * ratio;
        this.previewImageHeight = imageData.height * ratio;
        this.previewImageTransform = this.sanitizer.bypassSecurityTrustStyle(`translateX(-${left * ratio}px) translateY(-${top * ratio}px)`);
    }
}
