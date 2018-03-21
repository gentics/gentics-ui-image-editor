import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostListener,
    Input,
    Output,
    SimpleChanges
} from '@angular/core';
import {Subject} from "rxjs/Subject";
import {delay, takeUntil} from "rxjs/operators";

import {FocalPointService} from "../../providers/focal-point.service";

@Component({
    selector: 'gentics-focal-point-selector',
    templateUrl: 'focal-point-selector.component.html',
    styleUrls: ['focal-point-selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FocalPointSelectorComponent {

    @Input() focalPointX = 0.5;
    @Input() focalPointY = 0.5;
    @Input() enabled = false;
    @Output() focalPointSelect = new EventEmitter<{ x: number; y: number; }>();

    width: number;
    yLineLeft: number;
    yLineTop: number;
    height: number;
    xLineLeft: number;
    xLineTop: number;
    focalPointLeft: number;
    focalPointTop: number;

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
        const xInPixels = e.clientX - this.yLineLeft;
        const yInPixels = e.clientY - this.xLineTop;
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

    @HostListener('window:resize')
    private updatePositions(crosshairX?: number, crosshairY?: number): void {
        if (this.target) {
            const rect = this.target.getBoundingClientRect();

            this.width = rect.width;
            this.height = rect.height;
            this.focalPointTop = rect.top + (rect.height * this.focalPointY);
            this.focalPointLeft = rect.left + (rect.width * this.focalPointX);
            this.yLineLeft = rect.left;
            this.xLineTop = rect.top;
            this.xLineLeft = crosshairX || this.focalPointLeft;
            this.yLineTop = crosshairY || this.focalPointTop;
        }
    }
}
