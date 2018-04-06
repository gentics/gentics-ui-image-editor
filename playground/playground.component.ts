import {Component} from "@angular/core";
import {ImageTransformParams} from '../src/models';

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
    canCrop = true;
    canResize = true;
    canSetFocalPoint = true;
    prodMode = process.env.NODE_ENV === 'production';

    get sourceUrl(): string {
        const base = this.slowConnection ? 'http://localhost:4000/' : './test-images/';
        return base + this.sourceImage;
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
