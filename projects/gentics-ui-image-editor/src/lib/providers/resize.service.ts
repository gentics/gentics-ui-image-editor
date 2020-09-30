import {Injectable, OnDestroy} from '@angular/core';
import {Observable, BehaviorSubject, Subject, combineLatest} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';

import {Dimensions2D} from '../models';

@Injectable()
export class ResizeService implements OnDestroy {

    minWidth$: Observable<number>;
    maxWidth$: Observable<number>;
    minHeight$: Observable<number>;
    maxHeight$: Observable<number>;

    private previewWidth$ = new BehaviorSubject<number>(0);
    private previewHeight$ = new BehaviorSubject<number>(0);
    private initialDimensions$ = new BehaviorSubject<Dimensions2D>({ width: 0, height: 0 });
    private normalizedScaleValueX$ = new BehaviorSubject<number>(1);
    private normalizedScaleValueY$ = new BehaviorSubject<number>(1);
    private initialWidth: number;
    private initialHeight: number;
    private destroy$ = new Subject<void>();

    get currentWidth(): number {
        return this.previewWidth$.value;
    }

    get currentHeight(): number {
        return this.previewHeight$.value;
    }

    constructor() {
        this.minWidth$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.width * 0.01));

        this.maxWidth$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.width * 2));

        this.minHeight$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.height * 0.01));

        this.maxHeight$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.height * 2));

        combineLatest(this.previewWidth$, this.initialDimensions$).pipe(
            map(([previewWidth, initialDimensions]) => previewWidth / initialDimensions.width),
            takeUntil(this.destroy$)
        ).subscribe(this.normalizedScaleValueX$);

        combineLatest(this.previewHeight$, this.initialDimensions$).pipe(
            map(([previewHeight, initialDimensions]) => previewHeight / initialDimensions.height),
            takeUntil(this.destroy$)
        ).subscribe(this.normalizedScaleValueY$);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    enable(imageWidth: number, imageHeight: number, initialScaleX = 1, initialScaleY = 1): void {
        this.initialDimensions$.next({
            width: imageWidth,
            height: imageHeight
        });
        this.previewWidth$.next(imageWidth);
        this.previewHeight$.next(imageHeight);
        this.updateWidth(imageWidth * initialScaleX);
        this.updateHeight(imageHeight * initialScaleY);
        this.initialWidth = imageWidth;
        this.initialHeight = imageHeight;
    }

    reset(): void {
        this.updateWidth(this.initialWidth);
        this.updateHeight(this.initialHeight);
    }

    updateWidth(width: number): void {
        this.previewWidth$.next(width);
    }

    updateHeight(height: number): void {
        this.previewHeight$.next(height);
    }

    updateScaleY(scale: number): void {
        this.updateHeight(this.initialHeight * scale);
    }

    getNormalizedScaleValueX(): number {
        return this.normalizedScaleValueX$.value;
    }

    getNormalizedScaleValueY(): number {
        return this.normalizedScaleValueY$.value;
    }
}
