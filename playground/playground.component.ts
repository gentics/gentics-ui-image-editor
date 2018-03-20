import {Component} from "@angular/core";

@Component({
    selector: 'app',
    templateUrl: './playground.component.html',
    styleUrls: ['./playground.component.css']
})
export class PlaygroundAppComponent {
    maxHeight: 'container';
    sourceImage = 'portrait.jpg';
    slowConnection = false;

    get sourceUrl(): string {
        const base = this.slowConnection ? 'http://localhost:4000/' : './test-images/';
        return base + this.sourceImage;
    }
}
