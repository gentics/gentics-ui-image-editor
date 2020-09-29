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
    SimpleChanges,
    ViewChild
} from '@angular/core';
import {SafeStyle} from '@angular/platform-browser';
import {Observable} from 'rxjs';

import {ImageTransformParams} from '../../models';
import {ImagePreviewService} from '../../providers/preview.service';

/**
 * An image preview component which accepts crop and scale data and renders the resulting
 * image with width and height scales.
 */
@Component({
    selector: 'gentics-ui-image-preview',
    templateUrl: 'image-preview.component.html',
    styleUrls: ['image-preview.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ImagePreviewService]
})
export class GenticsImagePreviewComponent implements OnInit, OnChanges {
    @Input() src: string;
    @Input() maxHeight: number = 5000;
    @Input() transform: ImageTransformParams;
    @Output() imageLoad = new EventEmitter<HTMLImageElement>();

    @ViewChild('previewImage') previewImage: ElementRef;

    previewWidth$: Observable<number>;
    previewHeight$: Observable<number>;
    previewImageTransform$: Observable<SafeStyle>;
    previewImageWidth$: Observable<number>;
    previewImageHeight$: Observable<number>;
    actualHeight$: Observable<number>;
    actualWidth$: Observable<number>;

    constructor(private elementRef: ElementRef,
                private previewService: ImagePreviewService) {}

    ngOnInit(): void {
        this.previewService.registerContainer(this.elementRef.nativeElement, this.maxHeight);

        this.previewWidth$ = this.previewService.previewWidth$;
        this.previewHeight$ = this.previewService.previewHeight$;
        this.actualWidth$ = this.previewService.actualWidth$;
        this.actualHeight$ = this.previewService.actualHeight$;
        this.previewImageHeight$ = this.previewService.previewImageHeight$;
        this.previewImageWidth$ = this.previewService.previewImageWidth$;
        this.previewImageTransform$ = this.previewService.previewImageTransform$;
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('maxHeight' in changes) {
            this.resizeHandler();
        }
        if ('transform' in changes) {
            this.previewService.setScaleX(this.transform.scaleX);
            this.previewService.setScaleY(this.transform.scaleY);
            if (this.transform.cropRect) {
                this.previewService.setCropRect(this.transform.cropRect);
            }
        }
    }

    imageLoaded(): void {
        this.imageLoad.emit(this.previewImage.nativeElement);
        this.previewService.registerImage(this.previewImage.nativeElement);
    }

    @HostListener('window:resize')
    resizeHandler(): void {
        this.previewService.resize();
    }
}
