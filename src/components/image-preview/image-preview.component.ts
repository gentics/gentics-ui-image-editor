import {
    ChangeDetectionStrategy, Component, ElementRef, HostBinding, Input, SimpleChanges,
    ViewChild
} from '@angular/core';
import { DomSanitizer, SafeStyle } from "@angular/platform-browser";

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

    @HostBinding('style.minHeight.px') hostMinHeight: number = 0;
    @HostBinding('class.hidden') get hidden(): boolean {
        return !this.visible;
    };

    @ViewChild('previewImage') previewImage: ElementRef;

    cropBoxWidth: number;
    cropBoxHeight: number;
    previewImageTransform: SafeStyle = 'none';
    previewImageWidth: number;
    previewImageHeight: number;

    constructor(private sanitizer: DomSanitizer) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['visible']) {
            this.calculateMinHeight();
        }
    }

    /**
     * Calculates the styles to apply to the preview image based on the
     */
    recalculatePreview(cropper: Cropper): void {
        const imageData = cropper.getImageData();
        const cropBoxData = cropper.getCropBoxData();
        const canvasData = cropper.getCanvasData();

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
        this.previewImageTransform = this.sanitizer
            .bypassSecurityTrustStyle(`translateX(-${left * ratio}px) translateY(-${top * ratio}px)`);
    }

    private calculateMinHeight(): void {
        if (this.previewImage) {
            const img = this.previewImage.nativeElement as HTMLImageElement;
            this.hostMinHeight = this.visible ? img.height : 0;
        }
    }
}
