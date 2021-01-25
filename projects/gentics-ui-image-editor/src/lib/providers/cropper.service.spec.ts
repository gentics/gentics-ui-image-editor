import { CropperConstructor } from '../models';
import { CropperService } from './cropper.service';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';

const mockImageData = {
    naturalWidth: 800,
    naturalHeight: 600
};

class MockCropper {
  destroy = jasmine.createSpy('destroy') as any;
  disable = jasmine.createSpy('disable') as any;
  enable = jasmine.createSpy('enable') as any;
  getImageData = jasmine.createSpy('getImageData').and.returnValue(mockImageData) as any;
  setAspectRatio = jasmine.createSpy('setAspectRatio') as any;
  setData = jasmine.createSpy('setData') as any;
}

// @TODO: Fix unit tests
xdescribe('CropperService', () => {

    let cropperService: CropperService;
    let cropper: MockCropper;
    let mockCropperConstructor: jasmine.Spy;

    beforeEach(() => {
        mockCropperConstructor = jasmine.createSpy('Cropper constructor').and.callFake((imageElement, options) => {
            cropper = new MockCropper();
            if (typeof options.ready === 'function') {
                setTimeout(() => {
                    options.ready();
                });
            }
            return cropper;
        });

        TestBed.configureTestingModule({
            providers: [
                CropperService,
                { provide: CropperConstructor, useValue: mockCropperConstructor }
            ]
        });

        cropperService = TestBed.inject(CropperService);
        cropper = TestBed.inject(CropperConstructor);
    });

    describe('enable()', () => {

        it('instantiates cropper on first call', () => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, { kind: 'original' });

            expect(mockCropperConstructor).toHaveBeenCalledWith(imageEl, jasmine.anything());
        });

        it('calls cropper.enable on subsequent call', () => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, { kind: 'original' });
            cropperService.enable(imageEl, { kind: 'original' });

            expect(mockCropperConstructor).toHaveBeenCalledTimes(1);
            expect(cropper.enable).toHaveBeenCalledTimes(1);
        });

        it('destroys and re-instantiates cropper again if image src property changes', () => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, { kind: 'original' });

            expect(mockCropperConstructor).toHaveBeenCalledTimes(1);

            imageEl.src = 'bar';
            const oldCropper = cropper;
            cropperService.enable(imageEl, { kind: 'original' });
            expect(oldCropper.destroy).toHaveBeenCalledTimes(1);
            expect(mockCropperConstructor).toHaveBeenCalledTimes(2);
        });

    });

    it('disable() calls cropper.disable()', () => {
        const imageEl = { src: 'foo' } as any;
        cropperService.enable(imageEl, { kind: 'original' });

        cropperService.disable();

        expect(cropper.disable).toHaveBeenCalledTimes(1);
    });

    describe('setCropAspectRatio()', () => {

        beforeEach(() => {
            const imageEl = { src: 'foo' } as any;
            cropperService.enable(imageEl, { kind: 'original' });
        });

        it('calls cropper.setAspectRatio() with correct value for "original"', () => {
            const aspectRatio = mockImageData.naturalWidth / mockImageData.naturalHeight;
            cropperService.setCropAspectRatio({ kind: 'original' });

            expect(cropper.setAspectRatio).toHaveBeenCalledWith(aspectRatio);
        });

        it('calls cropper.setAspectRatio() with correct value for "square"', () => {
            cropperService.setCropAspectRatio({ kind: 'square' });

            expect(cropper.setAspectRatio).toHaveBeenCalledWith(1);
        });

        it('calls cropper.setAspectRatio() with correct value for "free"', () => {
            cropperService.setCropAspectRatio({ kind: 'free' });

            expect(cropper.setAspectRatio).toHaveBeenCalledWith(NaN);
        });

    });

    it('resetCrop() calls cropper.setData() with the natural image dimensions', fakeAsync(() => {
        const imageEl = { src: 'foo' } as any;
        cropperService.enable(imageEl, { kind: 'original' });

        cropperService.resetCrop();
        tick();

        expect(cropper.setData).toHaveBeenCalledWith({
            x: 0,
            y: 0,
            width: mockImageData.naturalWidth,
            height: mockImageData.naturalHeight
        });
    }));

    it('setCropData() calls cropper.setData() if the cropper is already enabled', fakeAsync(() => {
        const imageEl = { src: 'foo' } as any;
        cropperService.enable(imageEl, { kind: 'original' });
        tick();

        const data: any = { width: 100, height: 100 };
        cropperService.setCropData(data);

        expect(cropper.setData).toHaveBeenCalledWith({
            width: 100,
            height: 100
        });
    }));

    it('setCropData() stores the data and sets it once the cropper is ready', fakeAsync(() => {
        const aspectRatio = mockImageData.naturalWidth / mockImageData.naturalHeight;
        const data: any = { width: 100, height: 100 };
        const imageEl = { src: 'foo' } as any;
        cropperService.setCropData(data);

        cropperService.enable(imageEl, { kind: 'original' });
        tick();

        expect(cropper.setAspectRatio).toHaveBeenCalledWith(aspectRatio);
        expect(cropper.setData).toHaveBeenCalledWith({
            width: 100,
            height: 100
        });
    }));

});
