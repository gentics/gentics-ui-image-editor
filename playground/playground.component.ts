import {Component} from "@angular/core";

@Component({
    selector: 'app',
    templateUrl: './playground.component.html',
    styleUrls: ['./playground.component.css']
})
export class PlaygroundAppComponent {
    language = 'en';
    sourceImage = 'portrait.jpg';
    slowConnection = false;
    transformParams: any;
    canCrop = true;
    canResize = true;
    canSetFocalPoint = true;
    prodMode = process.env.NODE_ENV === 'production';

    get sourceUrl(): string {
        const base = this.slowConnection ? 'http://localhost:4000/' : './test-images/';
        return base + this.sourceImage;
    }
}
