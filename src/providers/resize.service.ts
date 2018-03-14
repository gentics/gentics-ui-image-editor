import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {Observable} from "rxjs/Observable";
import {map, tap} from "rxjs/operators";
import {Dimensions2D} from "../models";
import {combineLatest} from "rxjs/observable/combineLatest";

@Injectable()
export class ResizeService {

    resizeDimensions$: Observable<Dimensions2D>;
    min$: Observable<number>;
    max$: Observable<number>;

    private previewWidth$ = new BehaviorSubject<number>(0);
    private initialDimensions$ = new BehaviorSubject<Dimensions2D>({ width: 0, height: 0 });
    private normalizedScaleValue$ = new BehaviorSubject<number>(1);

    constructor() {
        this.resizeDimensions$ = combineLatest(
            this.previewWidth$,
            this.initialDimensions$
        ).pipe(
            map(([previewWidth, initialDimensions]) => {
               return {
                   width: Math.round(previewWidth),
                   height: Math.round((previewWidth / initialDimensions.width) * initialDimensions.height)
               };
            })
        );

        this.min$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.width * 0.1));

        this.max$ = this.initialDimensions$.pipe(
            map(initialDimensions => initialDimensions.width * 3));

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
    }

    update(width: number): void {
        this.previewWidth$.next(width);
    }

    getNormalizedScaleValue(): number {
        return this.normalizedScaleValue$.value;
    }
}
