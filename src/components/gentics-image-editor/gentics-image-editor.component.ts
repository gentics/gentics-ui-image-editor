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
import {CropperService} from "../../providers/cropper.service";
import {ResizeService} from "../../providers/resize.service";
import {getActualCroppedSize, getDefaultCropperData} from "../../utils";

@Component({
    selector: 'gentics-image-editor',
    templateUrl: './gentics-image-editor.component.html',
    styleUrls: ['./gentics-image-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Default
})
export class GenticsImageEditorComponent {

    @Input() src: string;
    @Input() maxHeight: 'container' | 'none' = 'container';

    @ViewChild('sourceImage') sourceImage: ElementRef;
    @ViewChild('controlPanel') controlPanel: ElementRef;
    @ViewChild(ImagePreviewComponent) imagePreview: ImagePreviewComponent;

    mode: Mode = 'preview';
    imageIsLoading = false;

    // crop-related state
    cropAspectRatio: AspectRatio = 'original';

    // resize-related state
    resizeScale = 1;
    resizeRangeValue = 0;
    resizeMin$: Observable<number>;
    resizeMax$: Observable<number>;
    resizeDimensions$: Observable<string>;

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
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('src' in changes) {
            this.imageIsLoading = true;
            if (this.mode === 'crop') {
                setTimeout(() => {
                    this.cropperService.enable(this.sourceImage.nativeElement, this.cropAspectRatio)
                        .then(() => this.imageIsLoading = false);
                });
            }
        }
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
        this.imageIsLoading = true;
        this.cropperService.enable(this.sourceImage.nativeElement, this.cropAspectRatio)
            .then(() => this.imageIsLoading = false);
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
