import {Component, ChangeDetectorRef} from "@angular/core";
import {ImageTransformParams, AspectRatio, AspectRatios} from '../src/models';

@Component({
    selector: 'app',
    templateUrl: './playground.component.html',
    styleUrls: ['./playground.component.css']
})
export class PlaygroundAppComponent {
    language = 'en';
    sourceImage = 'portrait.jpg';
    slowConnection = false;
    transformParams: Partial<ImageTransformParams> = {};
    disableAspectRatios: AspectRatio[] = [];
    customAspectRatios: AspectRatio[] = [];
    disableOriginal = false;
    disableSquare = false;
    disableFree = false;
    custom169 = false;
    custom32 = false;
    canCrop = true;
    canResize = true;
    canSetFocalPoint = true;
    isEditing = false;
    prodMode = process.env.NODE_ENV === 'production';

    constructor(private changeDetector: ChangeDetectorRef) {}

    get sourceUrl(): string {
        const base = this.slowConnection ? 'http://localhost:4000/' : './test-images/';
        return base + this.sourceImage;
    }

    updateAspectRatios() {
        setTimeout(() => {
            this.disableAspectRatios = [];
            this.customAspectRatios = [];
            if (this.custom169) { this.customAspectRatios.push({ kind: AspectRatios.Dimensions, width: 16, height: 9 }); }
            if (this.custom32) { this.customAspectRatios.push({ kind: AspectRatios.Dimensions, width: 3, height: 2 }); }
            if (this.disableOriginal) { this.disableAspectRatios.push(AspectRatio.get(AspectRatios.Original)); }
            if (this.disableSquare) { this.disableAspectRatios.push(AspectRatio.get(AspectRatios.Square)); }
            if (this.disableFree) { this.disableAspectRatios.push(AspectRatio.get(AspectRatios.Free)); }
            this.changeDetector.markForCheck();
            this.changeDetector.detectChanges();
        });
    }

    parseParams(params: string) {
        try {
            const parsed = JSON.parse(params);
            this.transformParams = parsed;
        } catch (e) {
            // ignore
        }
    }
}
