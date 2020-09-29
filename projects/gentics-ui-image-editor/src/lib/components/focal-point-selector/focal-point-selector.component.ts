import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import {Subject} from 'rxjs';
import {delay, takeUntil} from 'rxjs/operators';

import {FocalPointService} from '../../providers/focal-point.service';

@Component({
    selector: 'gentics-focal-point-selector',
    templateUrl: 'focal-point-selector.component.html',
    styleUrls: ['focal-point-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocalPointSelectorComponent implements OnInit, OnChanges, OnDestroy {

    @Input() focalPointX = 0.5;
    @Input() focalPointY = 0.5;
    @Input() enabled = false;
    @Output() focalPointSelect = new EventEmitter<{ x: number; y: number; }>();

    width: number;
    height: number;
    targetLeft: number;
    targetTop: number;
    yLineTop: number;
    xLineLeft: number;
    focalPointLeft: number;
    focalPointTop: number;

    readonly lineExtension = 5;

    private target: HTMLElement;
    private destroy$ = new Subject<void>();

    constructor(private focalPointService: FocalPointService,
                private changeDetector: ChangeDetectorRef) {}

    ngOnInit(): void {
        this.focalPointService.getTarget()
            .then(target => this.initTarget(target));
    }

    ngOnChanges(changes: SimpleChanges): void {
        if ('focalPointX' in changes || 'focalPointY' in changes) {
            this.updatePositions();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    overlayMouseMove(e: MouseEvent): void {
        this.updatePositions(e.clientX, e.clientY);
    }

    overlayMouseLeave(): void {
        this.updatePositions();
    }

    overlayClick(e: MouseEvent): void {
        const xInPixels = e.clientX - this.targetLeft + window.pageXOffset;
        const yInPixels = e.clientY - this.targetTop + window.pageYOffset;
        const xNormalized = xInPixels / this.width;
        const yNormalized = yInPixels / this.height;
        this.focalPointSelect.emit({ x: xNormalized, y: yNormalized });
    }

    private initTarget(target: HTMLElement): void {
        this.target = target;

        // Note: the following could also be achieved with a MutationObserver, but there appears to be some issue
        // (possibly with Zone.js) whereby it's use here causes an infinite loop.
        this.focalPointService.update$
            .pipe(
                // The delay is required to allow the changes to the target styles to be
                // reflected in the DOM
                delay(1),
                takeUntil(this.destroy$))
            .subscribe(() => {
                this.updatePositions();
                this.changeDetector.markForCheck();
            });
    }

    /**
     * This is necessary to fix the initially misplaced focal point when the image editor
     * is used in a Gentics UI Core modal, which uses CSS transitions for appearing.
     *
     * See https://github.com/gentics/gentics-ui-image-editor/issues/2
     */
    @HostListener('window:transitionend')
    onTransitionEnd(): void {
        this.updatePositions();
        this.changeDetector.markForCheck();
    }

    @HostListener('window:scroll')
    @HostListener('window:resize')
    private updatePositions(mouseX?: number, mouseY?: number): void {
        if (this.target) {
            const { width, height, top, left } = this.target.getBoundingClientRect();
            const crosshairX = mouseX - left;
            const crosshairY = mouseY - top;

            this.width = width;
            this.height = height;
            this.focalPointTop = height * this.focalPointY;
            this.focalPointLeft = width * this.focalPointX;
            this.targetLeft = left + window.pageXOffset;
            this.targetTop = top + window.pageYOffset;
            this.xLineLeft = crosshairX || this.focalPointLeft;
            this.yLineTop = crosshairY || this.focalPointTop;
        }
    }
}
