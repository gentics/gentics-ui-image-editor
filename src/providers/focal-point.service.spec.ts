import {Subject} from "rxjs/Subject";
import {take} from "rxjs/operators";

import {FocalPointService} from "./focal-point.service";

describe('FocalPointService', () => {

    it('getTarget() resolves with the value passed to registerTarget()', done => {
        const TARGET = {} as any;
        const focalPointService = new FocalPointService();

        focalPointService.getTarget().then(target => {
            expect(target).toBe(TARGET);
            done();
        });

        focalPointService.registerTarget(TARGET);
    });

    it('update$ emits when the stream passed to registerUpdateStream() does', done => {
        const updateStream$ = new Subject<void>();
        const focalPointService = new FocalPointService();
        let calls = 0;

        focalPointService.update$.pipe(take(3))
            .subscribe({
                next: () => calls++,
                complete: () => {
                    expect(calls).toBe(3);
                    done()
                }
            });

        focalPointService.registerUpdateStream(updateStream$);

        updateStream$.next();
        updateStream$.next();
        updateStream$.next();
    });
});