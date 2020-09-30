import {
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

import {CropRect, ImageTransformParams} from '../../models';
import {ImagePreviewService} from '../../providers/preview.service';

/**
 * An image preview component which accepts crop and scale data and renders the resulting
 * image with width and height scales.
 */
@Component({
    selector: 'gentics-image-preview-with-scales',
    templateUrl: 'image-preview-with-scales.component.html',
    styleUrls: ['image-preview-with-scales.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ImagePreviewService]
})
export class ImagePreviewWithScalesComponent implements OnInit, OnChanges {
    @Input() src: string;
    @Input() maxHeight: number;
    @Input() scaleX: number;
    @Input() scaleY: number;
    @Input() cropRect: CropRect;
    @Output() imageLoad = new EventEmitter<HTMLImageElement>();

    margin = 50;
    maxPreviewHeight = 0;
    transform: ImageTransformParams;
    scaleWrapperWidth$: Observable<number>;
    previewWidth$: Observable<number>;
    previewHeight$: Observable<number>;
    actualWidth$: Observable<number>;
    actualHeight$: Observable<number>;
    previewWidthIsLessThanActual$: Observable<boolean>;
    previewHeightIsLessThanActual$: Observable<boolean>;

    constructor(private elementRef: ElementRef,
                private previewService: ImagePreviewService) {}

    ngOnInit(): void {
        this.previewService.registerContainer(this.elementRef.nativeElement, this.maxHeight, this.margin);

        this.previewWidth$ = this.previewService.previewWidth$;
        this.previewHeight$ = this.previewService.previewHeight$;
        this.actualWidth$ = this.previewService.actualWidth$;
        this.actualHeight$ = this.previewService.actualHeight$;
        this.previewWidthIsLessThanActual$ = this.previewService.previewWidthIsLessThanActual$;
        this.previewHeightIsLessThanActual$ = this.previewService.previewHeightIsLessThanActual$;
        this.scaleWrapperWidth$ = this.previewWidth$.pipe(map(width => width + 3 * this.margin));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('maxHeight' in changes) {
            this.maxPreviewHeight = this.maxHeight - 2 * this.margin;
            this.resizeHandler();
        }
        if ('scaleX' in changes) {
            this.transform = { ...this.transform, ...{ scaleX: this.scaleX } };
            this.previewService.setScaleX(this.scaleX);
        }
        if ('scaleY' in changes) {
            this.transform = { ...this.transform, ...{ scaleY: this.scaleY } };
            this.previewService.setScaleY(this.scaleY);
        }
        if ('cropRect' in changes) {
            this.transform = {
                ...this.transform,
                ...{ cropRect: this.cropRect }
            };
            this.previewService.setCropRect(this.cropRect);
        }
    }

    imageLoaded(img: HTMLImageElement): void {
        this.imageLoad.emit(img);
        this.previewService.registerImage(img);
    }

    @HostListener('window:resize')
    resizeHandler(): void {
        this.previewService.resize();
    }
}
