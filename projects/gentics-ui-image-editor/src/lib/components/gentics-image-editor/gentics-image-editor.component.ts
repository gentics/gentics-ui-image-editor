
import {fromEvent, merge as observableMerge,  Observable, Subject } from 'rxjs';
import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges,
    ViewEncapsulation,
    ViewChild,
    ChangeDetectorRef
} from '@angular/core';

import {AspectRatio, CropRect, ImageTransformParams, Mode, AspectRatios} from '../../models';
import {CropperService} from '../../providers/cropper.service';
import {ResizeService} from '../../providers/resize.service';
import {coerceToBoolean, getDefaultCropRect} from '../../utils';
import {LanguageService, UILanguage} from '../../providers/language.service';
import {FocalPointService} from '../../providers/focal-point.service';
import {Select} from 'gentics-ui-core';
import {TranslatePipe} from '../../pipes/translate.pipe';
import * as _ from 'lodash';
import { ControlPanelComponent } from '../control-panel/control-panel.component';
import { debounceTime, map, startWith } from 'rxjs/operators';

@Component({
    selector: 'gentics-ui-image-editor',
    templateUrl: './gentics-image-editor.component.html',
    styleUrls: ['./gentics-image-editor.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        CropperService,
        FocalPointService,
        ResizeService
    ]
})
export class GenticsImageEditorComponent implements OnInit, OnChanges {

    @Input() src: string;
    @Input() transform: ImageTransformParams;
    @Input() language: UILanguage = 'en';
    @Input() disableAspectRatios: AspectRatio[] = [];
    @Input() customAspectRatios: AspectRatio[] = [];
    @Input()
    set canCrop(value: boolean) { this._canCrop = coerceToBoolean(value); }
    get canCrop(): boolean { return this._canCrop; }
    @Input()
    set canResize(value: boolean) { this._canResize = coerceToBoolean(value); }
    get canResize(): boolean { return this._canResize; }
    @Input()
    set canSetFocalPoint(value: boolean) { this._canSetFocalPoint = coerceToBoolean(value); }
    get canSetFocalPoint(): boolean { return this._canSetFocalPoint; }

    @Output() transformChange = new EventEmitter<ImageTransformParams>();
    @Output() editing = new EventEmitter<boolean>();

    @ViewChild('customAspectRatio') customCropRatioSelect: Select;
    @ViewChild('cropControlPanel', { read: ElementRef }) cropControlPanel: ElementRef;

    mode: Mode = 'preview';
    imageIsLoading = false;

    // crop-related state
    readonly AspectRatio = AspectRatio;
    readonly AspectRatios = AspectRatios;
    readonly DefaultAspectRatios: AspectRatio[] = [
        AspectRatio.get(AspectRatios.Original),
        AspectRatio.get(AspectRatios.Square),
        AspectRatio.get(AspectRatios.Free)
    ];
    AvailableAspectRatios: AspectRatio[] = [...this.DefaultAspectRatios];
    cropAspectRatio: AspectRatio = this.AvailableAspectRatios[0];
    cropRect: CropRect;
    isAspectRatioControlsFits$: Observable<boolean>;
    isAspectRatioControlsUpdated$ = new Subject<boolean>();

    // resize-related state
    resizeScaleX = 1;
    resizeScaleY = 1;
    scaleRatioLocked = true;
    resizeRangeValueX = 0;
    resizeRangeValueY = 0;
    private lastAppliedScaleX = 1;
    private lastAppliedScaleY = 1;

    // focal point-related state
    focalPointX = 0.5;
    focalPointY = 0.5;
    private lastAppliedFocalPointX: number;
    private lastAppliedFocalPointY: number;

    private previewImage: HTMLImageElement;
    private closestAncestorWithHeight: HTMLElement;
    private _canCrop = true;
    private _canResize = true;
    private _canSetFocalPoint = true;

    constructor(public cropperService: CropperService,
                public resizeService: ResizeService,
                private languageService: LanguageService,
                private elementRef: ElementRef,
                private translate: TranslatePipe,
                private changeDetector: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.closestAncestorWithHeight = this.getClosestAncestorWithHeight(this.elementRef.nativeElement);
        this.lastAppliedFocalPointX = this.focalPointX;
        this.lastAppliedFocalPointY = this.focalPointY;

        this.observeAspectRatioControls();
        this.updateAspectRatios();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('src' in changes) {
            this.imageIsLoading = true;
        }
        if ('language' in changes) {
            this.languageService.currentLanguage = this.language;
            this.showPlaceholder();
        }
        if ('transform' in changes) {
            const transform: ImageTransformParams = changes.transform.currentValue;
            if (transform) {
                this.updateTransform(transform);
            }
        }
        if ('disableAspectRatios' in changes) {
            this.updateAspectRatios();
        }
        if ('customAspectRatios' in changes) {
            this.updateAspectRatios();
        }
    }

    observeAspectRatioControls(): void {
        const checkAspectRatioControlsSize = () => {
                if (this.cropControlPanel) {
                    const controlsDiv = this.cropControlPanel.nativeElement.querySelector('div.controls');
                    const aspectRatioControlsDiv = controlsDiv.querySelector('div.aspect-ratios-large');
                    return controlsDiv.offsetWidth > aspectRatioControlsDiv.offsetWidth;
                }
                return true;
        }

        const screenSizeChanged$ = observableMerge(
            this.isAspectRatioControlsUpdated$.asObservable(),
            fromEvent(window, 'resize')
        ).pipe(
          debounceTime(50),
          map(checkAspectRatioControlsSize),
        );

        this.isAspectRatioControlsFits$ = screenSizeChanged$.pipe(startWith(checkAspectRatioControlsSize()));
    }

    onAspectRatioChange(): void {
        this.showPlaceholder();
    }

    get parentHeight(): number {
        return this.closestAncestorWithHeight ? this.closestAncestorWithHeight.offsetHeight : 0;
    }

    get imageAreaHeight(): number {
        const controlPanelHeight = 65;
        const realHeight = this.parentHeight - controlPanelHeight;
        const minHeight = 300;
        return Math.max(realHeight, minHeight);
    }

    onImageLoad(img: HTMLImageElement): void {
        this.imageIsLoading = false;
        this.previewImage = img;
        this.cropRect = getDefaultCropRect(img, this.transform);
    }

    setMode(modeClicked: Mode): void {
        if (this.mode !== modeClicked) {
            this.exitMode(this.mode);
            this.enterMode(modeClicked);
            this.mode = modeClicked;
        }
    }

    resetCrop(): void {
        this.cropAspectRatio = this.AvailableAspectRatios[0];
        this.cropperService.resetCrop();
    }

    applyCrop(): void {
        this.cropRect = this.cropperService.cropRect;
        this.resetFocalPoint();
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
     * Hacky way to implement placeholder for the Select box. It receives the list of elements,
     * and if there is nothing selected then it will change the Select box viewValue.
     * setTimeout required for update after the Select box sets the displayed value itself.
     *
     * TODO: Implement placeholder function in GUIC
     * @param items The selected items of the Select box
     */
    showPlaceholder(): void {
        setTimeout(() => {
            if (this.mode === 'crop' &&
                !!this.customCropRatioSelect &&
                this.filterShowAspectRatio(this.AvailableAspectRatios, 'select').indexOf(this.cropAspectRatio) === -1
            ) {
                this.customCropRatioSelect.viewValue = this.translate.transform('more_aspect_ratios');
                this.changeDetector.markForCheck();
            }

            // Notify observer that Aspect Ratio Controls updated
            this.isAspectRatioControlsUpdated$.next(true);
        });
    }

    shouldShowAspectRatio(value: AspectRatio): boolean {
        return this.AvailableAspectRatios.some( availableRatio => _.isEqual(availableRatio, value) );
    }

    filterShowAspectRatio(values: AspectRatio[], display?: 'radio' | 'select'): AspectRatio[] {
        return values.filter(
            value => this.AvailableAspectRatios.some( availableRatio => _.isEqual(availableRatio, value) ) &&
            ( ( display && value.display && display === value.display ) ||
              ( display && !value.display && display === 'select') ||
              ( !display )
            )
        );
    }

    /**
     * Emit the ImageTransformParams resulting from the currently-applied transformations.
     */
    private emitImageTransformParams(): void {
        const toPrecision = x => parseFloat(x.toFixed(5));

        this.transformChange.emit({
            width: toPrecision(this.cropRect.width * this.resizeScaleX),
            height: toPrecision(this.cropRect.height * this.resizeScaleY),
            scaleX: toPrecision(this.resizeScaleX),
            scaleY: toPrecision(this.resizeScaleY),
            cropRect: {
                startX: toPrecision(this.cropRect.startX),
                startY: toPrecision(this.cropRect.startY),
                width: toPrecision(this.cropRect.width),
                height: toPrecision(this.cropRect.height)
            },
            focalPointX: toPrecision(this.focalPointX),
            focalPointY: toPrecision(this.focalPointY)
        });
    }

    private enterMode(mode: Mode): void {
        switch (mode) {
            case 'crop':
                this.onEnterCropMode();
                this.editing.emit(true);
                break;
            case 'resize':
                this.onEnterResizeMode();
                this.editing.emit(true);
                break;
            case 'focalPoint':
                this.onEnterFocalPointMode();
                this.editing.emit(true);
                break;
            default:
                this.onEnterPreviewMode();
                this.editing.emit(false);
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
        this.showPlaceholder();
        this.imageIsLoading = true;
    }

    private onExitCropMode(): void {}

    private onEnterResizeMode(): void {
        let cropRect = this.cropperService.cropRect;
        if (!cropRect) {
            cropRect = getDefaultCropRect(this.previewImage);
        }
        const { width, height } = cropRect;
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

    /**
     * Safely updates local state based on changes to the transform input
     */
    private updateTransform(transform: ImageTransformParams): void {
        const defined = val => val !== undefined && val !== null;

        if (defined(transform.focalPointX)) {
            this.focalPointX = transform.focalPointX;
        }
        if (defined(transform.focalPointY)) {
            this.focalPointY = transform.focalPointY;
        }
        if (defined(transform.scaleX)) {
            this.resizeScaleX = transform.scaleX;
        }
        if (defined(transform.scaleY)) {
            this.resizeScaleY = transform.scaleY;
        }
        if (this.resizeScaleX !== this.resizeScaleY) {
            this.scaleRatioLocked = false;
        }

        let cropData: Partial<Cropper.Data> = {};
        const cropRect = transform.cropRect;
        if (cropRect) {
            if (defined(cropRect.width)) {
                cropData.width = cropRect.width;
            }
            if (defined(cropRect.height)) {
                cropData.height = cropRect.height;
            }
            if (defined(cropRect.startX)) {
                cropData.x = cropRect.startX;
            }
            if (defined(cropRect.startY)) {
                cropData.y = cropRect.startY;
            }
            this.cropRect = getDefaultCropRect(this.previewImage, transform);
        }
        this.cropperService.setCropData(cropData);
    }

    private updateAspectRatios() {
        // Add CustomAspect ratios and filter out disabled AspectRatios
        this.AvailableAspectRatios = [...this.DefaultAspectRatios, ...this.customAspectRatios].filter(
            ratio => !this.disableAspectRatios.some( disabledRatio => _.isEqual(disabledRatio, ratio) )
        );

        // Provide at least one available aspect ratio (Free)
        if (this.AvailableAspectRatios.length === 0) {
            this.AvailableAspectRatios.push(AspectRatio.get(AspectRatios.Free));
        }

        // Generate label for aspect ratios
        this.AvailableAspectRatios = this.AvailableAspectRatios.map(ratio => {
            if (!ratio.label) {
                switch (ratio.kind) {
                    case 'dimensions':
                        ratio.label = `${ratio.width}:${ratio.height}`;
                        break;
                    case 'original':
                        ratio.label = AspectRatio.get(AspectRatios.Original).label;
                        break;
                    case 'square':
                        ratio.label = AspectRatio.get(AspectRatios.Square).label;
                        break;
                    case 'free':
                        ratio.label = AspectRatio.get(AspectRatios.Free).label;
                        break;
                }
            }
            return ratio;
        });

        this.cropAspectRatio = this.AvailableAspectRatios[0];
        this.showPlaceholder();

        // Notify observer that Aspect Ratio Controls updated
        this.isAspectRatioControlsUpdated$.next(true);
    }
}
