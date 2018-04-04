import {skip, take} from "rxjs/operators";

import {ResizeService} from "./resize.service";

describe('ResizeService', () => {

    const IMAGE_WIDTH = 800;
    const IMAGE_HEIGHT = 400;

    it('correctly sets minWidth$ value', done => {
        const resizeService = new ResizeService();
        resizeService.minWidth$
            .pipe(skip(1), take(1))
            .subscribe(val => {
                expect(val).toBe(IMAGE_WIDTH * 0.01);
                done();
            });

        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
    });

    it('correctly sets maxWidth$ value', done => {
        const resizeService = new ResizeService();
        resizeService.maxWidth$
            .pipe(skip(1), take(1))
            .subscribe(val => {
                expect(val).toBe(IMAGE_WIDTH * 2);
                done();
            });

        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
    });

    it('correctly sets minHeight$ value', done => {
        const resizeService = new ResizeService();
        resizeService.minHeight$
            .pipe(skip(1), take(1))
            .subscribe(val => {
                expect(val).toBe(IMAGE_HEIGHT * 0.01);
                done();
            });

        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
    });

    it('correctly sets maxHeight$ value', done => {
        const resizeService = new ResizeService();
        resizeService.maxHeight$
            .pipe(skip(1), take(1))
            .subscribe(val => {
                expect(val).toBe(IMAGE_HEIGHT * 2);
                done();
            });

        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
    });

    it('updateWidth() updates the currentWidth value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
        expect(resizeService.currentWidth).toBe(IMAGE_WIDTH);

        resizeService.updateWidth(300);
        expect(resizeService.currentWidth).toBe(300);
    });

    it('updateHeight() updates the currentHeight value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);
        expect(resizeService.currentHeight).toBe(IMAGE_HEIGHT);

        resizeService.updateHeight(300);
        expect(resizeService.currentHeight).toBe(300);
    });

    it('updateScaleY() correctly updates the currentHeight value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);

        resizeService.updateScaleY(2);
        expect(resizeService.currentHeight).toBe(IMAGE_HEIGHT * 2);
    });

    it('reset() returns the currentWidth to the initial value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);

        resizeService.updateWidth(300);
        expect(resizeService.currentWidth).toBe(300);

        resizeService.reset();
        expect(resizeService.currentWidth).toBe(IMAGE_WIDTH);
    });

    it('reset() returns the currentHeight to the initial value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);

        resizeService.updateHeight(300);
        expect(resizeService.currentHeight).toBe(300);

        resizeService.reset();
        expect(resizeService.currentHeight).toBe(IMAGE_HEIGHT);
    });

    it('getNormalizedScaleValueX() returns the correct value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);

        expect(resizeService.getNormalizedScaleValueX()).toBe(1);

        resizeService.updateWidth(IMAGE_WIDTH * 1.3);
        expect(resizeService.getNormalizedScaleValueX()).toBe(1.3);

        resizeService.updateWidth(IMAGE_WIDTH * .543);
        expect(resizeService.getNormalizedScaleValueX()).toBe(.543);
    });

    it('getNormalizedScaleValueY() returns the correct value', () => {
        const resizeService = new ResizeService();
        resizeService.enable(IMAGE_WIDTH, IMAGE_HEIGHT, 1);

        expect(resizeService.getNormalizedScaleValueY()).toBe(1);

        resizeService.updateHeight(IMAGE_HEIGHT * 1.3);
        expect(resizeService.getNormalizedScaleValueY()).toBe(1.3);

        resizeService.updateHeight(IMAGE_HEIGHT * .543);
        expect(resizeService.getNormalizedScaleValueY()).toBe(.543);
    });
});
