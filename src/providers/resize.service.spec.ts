import {skip, take} from "rxjs/operators";

import {ResizeService} from "./resize.service";

describe('ResizeService', () => {

    const IMAGE_WIDTH = 800;
    const IMAGE_HEIGHT = 400;

    it('correctly sets min$ value', done => {
        const resizeService = new ResizeService();
        resizeService.min$
            .pipe(skip(1), take(1))
            .subscribe(val => {
                expect(val).toBe(IMAGE_WIDTH * 0.01);
                done();
            });

        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
    });

    it('correctly sets max$ value', done => {
        const resizeService = new ResizeService();
        resizeService.max$
            .pipe(skip(1), take(1))
            .subscribe(val => {
                expect(val).toBe(IMAGE_WIDTH * 2);
                done();
            });

        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
    });

    it('update() updates the currentWidth value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
        expect(resizeService.currentWidth).toBe(IMAGE_WIDTH);

        resizeService.update(300);
        expect(resizeService.currentWidth).toBe(300);
    });

    it('reset() returns the currentWidth to the initial value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);

        resizeService.update(300);
        expect(resizeService.currentWidth).toBe(300);

        resizeService.reset();
        expect(resizeService.currentWidth).toBe(IMAGE_WIDTH);
    });

    it('getNormalizedScaleValue() returns the correct value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);

        expect(resizeService.getNormalizedScaleValue()).toBe(1);

        resizeService.update(IMAGE_WIDTH * 1.3);
        expect(resizeService.getNormalizedScaleValue()).toBe(1.3);

        resizeService.update(IMAGE_WIDTH * .543);
        expect(resizeService.getNormalizedScaleValue()).toBe(.543);
    });
});
