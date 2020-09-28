import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {filter, take, takeUntil} from 'rxjs/operators';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class FocalPointService implements OnDestroy {

    /**
     * An observable which signals that the Focal Point overlay position should be re-calculated.
     */
    update$: Observable<void>;

    private _update$ = new Subject<void>();
    private target$ = new BehaviorSubject<HTMLElement | null>(null);
    private destroy$ = new Subject<void>();

    constructor() {
        this.update$ = this._update$.asObservable();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    /**
     * Register the element which defines the position and dimensions for the Focal Point overlay.
     */
    registerTarget(target: HTMLElement) {
        this.target$.next(target);
    }

    /**
     * Register an observable which signals that the Focal Point overlay positions need to be re-calculated.
     */
    registerUpdateStream(updateStream$: Observable<any>): void {
        updateStream$
            .pipe(takeUntil(this.destroy$))
            .subscribe(this._update$)
    }

    /**
     * Get the target element which will be registered via registerTarget().
     */
    getTarget(): Promise<HTMLElement> {
        return this.target$.pipe(
            filter(el => el !== null),
            take(1)
        ).toPromise();
    }
}
