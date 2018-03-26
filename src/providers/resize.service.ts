import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {combineLatest} from "rxjs/observable/combineLatest";
import {map} from "rxjs/operators";

import {Dimensions2D} from "../models";

@Injectable()
export class ResizeService {

    min$: Observable<number>;
    max$: Observable<number>;

    private previewWidth$ = new BehaviorSubject<number>(0);
    private initialDimensions$ = new BehaviorSubject<Dimensions2D>({ width: 0, height: 0 });
    private normalizedScaleValue$ = new BehaviorSubject<number>(1);
    private initialWidth: number;

    get currentWidth(): number {
        return this.previewWidth$.value;
    }

    constructor() {
        this.min$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.width * 0.01));

        this.max$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.width * 2));

        combineLatest(this.previewWidth$, this.initialDimensions$).pipe(
            map(([previewWidth, initialDimensions]) => previewWidth / initialDimensions.width)
        ).subscribe(this.normalizedScaleValue$);
    }

    enable(imageWidth: number, imageHeight: number, initialScale = 1): void {
        this.initialDimensions$.next({
            width: imageWidth,
            height: imageHeight
        });
        this.previewWidth$.next(imageWidth);
        this.update(imageWidth * initialScale);
        this.initialWidth = imageWidth;
    }

    reset(): void {
        this.update(this.initialWidth);
    }

    update(width: number): void {
        this.previewWidth$.next(width);
    }

    getNormalizedScaleValue(): number {
        return this.normalizedScaleValue$.value;
    }
}
