import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input, OnChanges, OnInit,
    Output,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';

import {ImagePreviewComponent} from '../image-preview/image-preview.component';
import {AspectRatio, ImageTransformParams, Mode} from '../../models';
import {CropperData, CropperService} from '../../providers/cropper.service';
import {ResizeService} from '../../providers/resize.service';
import {getDefaultCropperData} from '../../utils';
import {LanguageService, UILanguage} from '../../providers/language.service';

@Component({
    selector: 'gentics-image-editor',
    templateUrl: './gentics-image-editor.component.html',
    styleUrls: ['./gentics-image-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenticsImageEditorComponent implements OnInit, OnChanges {

    @Input() src: string;
    @Input() focalPointX = 0.5;
    @Input() focalPointY = 0.5;
    @Input() language: UILanguage = 'en';
    @Output() transform = new EventEmitter<ImageTransformParams>();

    @ViewChild('controlPanel') controlPanel: ElementRef;
    @ViewChild(ImagePreviewComponent) imagePreview: ImagePreviewComponent;

    mode: Mode = 'preview';
    imageIsLoading = false;

    // crop-related state
    cropAspectRatio: AspectRatio = 'original';
    cropperData: CropperData;

    // resize-related state
    resizeScaleX = 1;
    resizeScaleY = 1;
    scaleRatioLocked = true;
    resizeRangeValueX = 0;
    resizeRangeValueY = 0;
    private lastAppliedScaleX = 1;
    private lastAppliedScaleY = 1;

    // focal point-related state
    private lastAppliedFocalPointX: number;
    private lastAppliedFocalPointY: number;

    private closestAncestorWithHeight: HTMLElement;

    constructor(public cropperService: CropperService,
                public resizeService: ResizeService,
                private languageService: LanguageService,
                private elementRef: ElementRef) {}

    ngOnInit(): void {
        this.closestAncestorWithHeight = this.getClosestAncestorWithHeight(this.elementRef.nativeElement);
        this.lastAppliedFocalPointX = this.focalPointX;
        this.lastAppliedFocalPointY = this.focalPointY;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('src' in changes) {
            this.imageIsLoading = true;
        }
        if ('language' in changes) {
            this.languageService.currentLanguage = this.language;
        }
    }

    get parentHeight(): number {
        return this.closestAncestorWithHeight ? this.closestAncestorWithHeight.offsetHeight : 0;
    }

    get imageAreaHeight(): number {
        const controlPanelHeight = this.controlPanel ? this.controlPanel.nativeElement.offsetHeight : 0;
        const realHeight = this.parentHeight - controlPanelHeight;
        const minHeight = 300;
        return Math.max(realHeight, minHeight);
    }

    setMode(modeClicked: Mode): void {
        if (this.mode !== modeClicked) {
            this.exitMode(this.mode);
            this.enterMode(modeClicked);
            this.mode = modeClicked;
        }
    }

    resetCrop(): void {
        this.cropAspectRatio = 'original';
        this.cropperService.resetCrop();
    }

    applyCrop(): void {
        this.cropperData = this.cropperService.cropperData;
        this.setMode('preview');
        this.emitImageTransformParams();
    }

    cancelCrop(): void {
        this.setMode('preview');
    }

    resetScale(): void {
        this.resizeService.reset();
        this.resizeRangeValueX = this.resizeService.currentWidth;
        this.resizeRangeValueY = this.resizeService.currentHeight;
        this.resizeScaleX = 1;
        this.resizeScaleY = 1;
    }

    previewResizeWidth(width: number): void {
        this.resizeService.updateWidth(width);
        this.resizeScaleX = this.resizeService.getNormalizedScaleValueX();
        if (this.scaleRatioLocked) {
            this.synchronizeHeightScale();
        }
    }

    previewResizeHeight(height: number): void {
        this.resizeService.updateHeight(height);
        this.resizeScaleY = this.resizeService.getNormalizedScaleValueY();
    }

    toggleScaleRatioLock(): void {
        this.scaleRatioLocked = !this.scaleRatioLocked;
        if (this.scaleRatioLocked) {
            this.synchronizeHeightScale();
        }
    }

    private synchronizeHeightScale(): void {
        this.resizeScaleY = this.resizeScaleX;
        this.resizeService.updateScaleY(this.resizeScaleY);
        this.resizeRangeValueY = this.resizeService.currentHeight;
    }

    applyResize(): void {
        const scaleX = this.resizeService.getNormalizedScaleValueX();
        const scaleY = this.resizeService.getNormalizedScaleValueY();
        this.resizeScaleX = scaleX;
        this.lastAppliedScaleX = scaleX;
        this.resizeScaleY = scaleY;
        this.lastAppliedScaleY = scaleY;
        this.setMode('preview');
        this.emitImageTransformParams();
    }

    cancelResize(): void {
        this.resizeScaleX = this.lastAppliedScaleX;
        this.resizeScaleY = this.lastAppliedScaleY;
        this.setMode('preview');
    }

    focalPointSelected(focalPoint: { x: number; y: number; }): void {
        this.focalPointX = focalPoint.x;
        this.focalPointY = focalPoint.y;
    }

    resetFocalPoint(): void {
        this.focalPointX = 0.5;
        this.focalPointY = 0.5;
    }

    applyFocalPoint(): void {
        this.lastAppliedFocalPointX = this.focalPointX;
        this.lastAppliedFocalPointY = this.focalPointY;
        this.setMode('preview');
        this.emitImageTransformParams();
    }

    cancelFocalPoint(): void {
        this.focalPointX = this.lastAppliedFocalPointX;
        this.focalPointY = this.lastAppliedFocalPointY;
        this.setMode('preview');
    }

    /**
     * Emit the ImageTransformParams resulting from the currently-applied transformations.
     */
    private emitImageTransformParams(): void {
        const toPrecision = x => parseFloat(x.toFixed(5));
        let cropperData: CropperData;
        if (this.cropperData) {
            cropperData = this.cropperData;
        } else {
            cropperData = getDefaultCropperData(this.imagePreview.previewImage.nativeElement);
        }
        const { outputData } = cropperData;


        this.transform.emit({
            width: toPrecision(outputData.width * this.resizeScaleX),
            height: toPrecision(outputData.height * this.resizeScaleY),
            scaleX: toPrecision(this.resizeScaleX),
            scaleY: toPrecision(this.resizeScaleY),
            cropRect: {
                startX: toPrecision(outputData.x),
                startY: toPrecision(outputData.y),
                width: toPrecision(outputData.width),
                height: toPrecision(outputData.height)
            },
            focalPointX: toPrecision(this.focalPointX),
            focalPointY: toPrecision(this.focalPointY)
        });
    }

    private enterMode(mode: Mode): void {
        switch (mode) {
            case 'crop':
                this.onEnterCropMode();
                break;
            case 'resize':
                this.onEnterResizeMode();
                break;
            case 'focalPoint':
                this.onEnterFocalPointMode();
                break;
            default:
                this.onEnterPreviewMode();
        }
    }

    private exitMode(mode: Mode): void {
        switch (mode) {
            case 'crop':
                this.onExitCropMode();
                break;
            case 'resize':
                this.onExitResizeMode();
                break;
            case 'focalPoint':
                this.onExitFocalPointMode();
                break;
            default:
                this.onExitPreviewMode();
        }
    }

    private onEnterPreviewMode(): void {}

    private onExitPreviewMode(): void {}

    private onEnterCropMode(): void {
        this.imageIsLoading = true;
    }

    private onExitCropMode(): void {}

    private onEnterResizeMode(): void {
        let cropperData = this.cropperService.cropperData;
        if (!cropperData) {
            cropperData = getDefaultCropperData(this.imagePreview.previewImage.nativeElement);
        }
        const { width, height } = cropperData.outputData;
        this.resizeService.enable(width, height, this.resizeScaleX, this.resizeScaleY);
        this.resizeRangeValueX = width * this.resizeScaleX;
        this.resizeRangeValueY = height * this.resizeScaleY;
    }

    private onExitResizeMode(): void {}

    private onEnterFocalPointMode(): void {}

    private onExitFocalPointMode(): void {}

    /**
     * Walks up the DOM tree from the starting element and returns the first ancestor element with a non-zero
     * offsetHeight.
     */
    private getClosestAncestorWithHeight(startingElement: HTMLElement): HTMLElement {
        let currentEl = startingElement.parentElement;
        while (currentEl.offsetHeight === 0 && currentEl !== document.body) {
            currentEl = currentEl.parentElement;
        }
        return currentEl;
    }
}
