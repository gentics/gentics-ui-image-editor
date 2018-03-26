import {fakeAsync, TestBed, tick} from "@angular/core/testing";

import {CropperService} from "./cropper.service";
import {CropperConstructor} from "../models";

const mockImageData = {
    naturalWidth: 800,
    naturalHeight: 600
};

describe('CropperService', () => {

    let cropperService: CropperService;
    let cropper: MockCropper;
    let mockCropperConstructor: jasmine.Spy;

    beforeEach(() => {
        mockCropperConstructor = jasmine.createSpy('Cropper constructor').and.callFake(() => {
            cropper = new MockCropper();
            return cropper;
        });
        TestBed.configureTestingModule({
            providers: [
                CropperService,
                { provide: CropperConstructor, useValue: mockCropperConstructor }
            ]
        });

        cropperService = TestBed.get(CropperService);
        cropper = TestBed.get(CropperConstructor);
    });

    describe('enable()', () => {

        it('instantiates cropper on first call', () => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, 'original');

            expect(mockCropperConstructor).toHaveBeenCalledWith(imageEl, jasmine.anything());
        });

        it('calls cropper.enable on subsequent call', () => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, 'original');
            cropperService.enable(imageEl, 'original');

            expect(mockCropperConstructor).toHaveBeenCalledTimes(1);
            expect(cropper.enable).toHaveBeenCalledTimes(1);
        });

        it('destroys and re-instantiates cropper again if image src property changes', () => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, 'original');

            expect(mockCropperConstructor).toHaveBeenCalledTimes(1);

            imageEl.src = 'bar';
            const oldCropper = cropper;
            cropperService.enable(imageEl, 'original');
            expect(oldCropper.destroy).toHaveBeenCalledTimes(1);
            expect(mockCropperConstructor).toHaveBeenCalledTimes(2);
        });

    });

    it('disable() calls cropper.disable()', () => {
        const imageEl = { src: 'foo' } as any;
        cropperService.enable(imageEl, 'original');

        cropperService.disable();

        expect(cropper.disable).toHaveBeenCalledTimes(1);
    });

    describe('setCropAspectRatio()', () => {

        beforeEach(() => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, 'original');
        });

        it('calls cropper.setAspectRatio() with correct value for "original"', () => {
            const aspectRatio = mockImageData.naturalWidth / mockImageData.naturalHeight;
            cropperService.setCropAspectRatio('original');

            expect(cropper.setAspectRatio).toHaveBeenCalledWith(aspectRatio);
        });

        it('calls cropper.setAspectRatio() with correct value for "square"', () => {
            cropperService.setCropAspectRatio('square');

            expect(cropper.setAspectRatio).toHaveBeenCalledWith(1);
        });

        it('calls cropper.setAspectRatio() with correct value for "free"', () => {
            cropperService.setCropAspectRatio('free');

            expect(cropper.setAspectRatio).toHaveBeenCalledWith(NaN);
        });

    });

    it('resetCrop() calls cropper.setData() with the natural image dimensions', fakeAsync(() => {
        const imageEl = { src: 'foo' } as any;
        cropperService.enable(imageEl, 'original');

        cropperService.resetCrop();
        tick();

        expect(cropper.setData).toHaveBeenCalledWith({
            x: 0,
            y: 0,
            width: mockImageData.naturalWidth,
            height: mockImageData.naturalHeight
        });
    }));

});


class MockCropper {
    destroy = jasmine.createSpy('destroy');
    disable = jasmine.createSpy('disable');
    enable = jasmine.createSpy('enable');
    getImageData = jasmine.createSpy('getImageData').and.returnValue(mockImageData);
    setAspectRatio = jasmine.createSpy('setAspectRatio');
    setData = jasmine.createSpy('setData');
}
