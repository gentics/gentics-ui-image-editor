import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    Input,
    SimpleChanges,
    ViewChild,
    ViewEncapsulation
} from '@angular/core';
import {Observable} from "rxjs/Observable";
import {map} from "rxjs/operators";

import {ImagePreviewComponent} from "../image-preview/image-preview.component";
import {AspectRatio, Mode} from "../../models";
import {CropperData, CropperService} from "../../providers/cropper.service";
import {ResizeService} from "../../providers/resize.service";
import {getActualCroppedSize, getDefaultCropperData} from "../../utils";

@Component({
    selector: 'gentics-image-editor',
    templateUrl: './gentics-image-editor.component.html',
    styleUrls: ['./gentics-image-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class GenticsImageEditorComponent {

    @Input() src: string;
    @Input() focalPointX: number = 0.5;
    @Input() focalPointY: number = 0.5;
    @Input() maxHeight: 'container' | 'none' = 'container';

    @ViewChild('controlPanel') controlPanel: ElementRef;
    @ViewChild(ImagePreviewComponent) imagePreview: ImagePreviewComponent;

    mode: Mode = 'preview';
    imageIsLoading = false;

    // crop-related state
    cropAspectRatio: AspectRatio = 'original';
    cropperData: CropperData;

    // resize-related state
    resizeScale = 1;
    resizeRangeValue = 0;
    resizeMin$: Observable<number>;
    resizeMax$: Observable<number>;
    resizeDimensions$: Observable<string>;
    private lastAppliedScale = 1;

    // focal point-related state
    private lastAppliedFocalPointX: number;
    private lastAppliedFocalPointY: number;

    private closestAncestorWithHeight: HTMLElement;

    get parentHeight(): number {
        return this.closestAncestorWithHeight ? this.closestAncestorWithHeight.offsetHeight: 0;
    }

    get imageAreaHeight(): number {
        const controlPanelHeight = this.controlPanel ? this.controlPanel.nativeElement.offsetHeight : 0;
        const realHeight = this.parentHeight - controlPanelHeight;
        const minHeight = 300;
        return Math.max(realHeight, minHeight);
    }

    constructor(private cropperService: CropperService,
                private elementRef: ElementRef,
                private resizeService: ResizeService) {}

    ngOnInit(): void {
        this.resizeMin$ = this.resizeService.min$;
        this.resizeMax$ = this.resizeService.max$;
        this.resizeDimensions$ = this.resizeService.resizeDimensions$.pipe(
            map(dimensions => `${dimensions.width}px x ${dimensions.height}px`));

        this.closestAncestorWithHeight = this.getClosestAncestorWithHeight(this.elementRef.nativeElement);
        this.lastAppliedFocalPointX = this.focalPointX;
        this.lastAppliedFocalPointY = this.focalPointY;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('src' in changes) {
            this.imageIsLoading = true;
        }
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
    }

    cancelCrop(): void {
        this.setMode('preview');
    }

    resetScale(): void {
        this.resizeService.reset();
        this.resizeRangeValue = this.resizeService.currentWidth;
        this.resizeScale = 1;
    }

    previewResize(width: number): void {
        this.resizeService.update(width);
        this.resizeScale = this.resizeService.getNormalizedScaleValue();
    }

    applyResize(): void {
        const scale = this.resizeService.getNormalizedScaleValue();
        this.resizeScale = scale;
        this.lastAppliedScale = scale;
        this.setMode('preview');
    }

    cancelResize(): void {
        this.resizeScale = this.lastAppliedScale;
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
    }

    cancelFocalPoint(): void {
        this.focalPointX = this.lastAppliedFocalPointX;
        this.focalPointY = this.lastAppliedFocalPointY;
        this.setMode('preview');
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
        const { width, height } = getActualCroppedSize(cropperData);
        this.resizeService.enable(width, height, this.resizeScale);
        this.resizeRangeValue = width * this.resizeScale;
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
