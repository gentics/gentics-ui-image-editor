import {BrowserModule} from '@angular/platform-browser';
import {Component, NgModule} from '@angular/core';

import {GenticsImageEditorModule} from '../dist/index.js';

declare const require: any;
require('./playground.scss');

@Component({
    selector: 'app',
    templateUrl: './playground.html'
})
class PlaygroundAppComponent {}

@NgModule({
    bootstrap: [ PlaygroundAppComponent ],
    declarations: [ PlaygroundAppComponent ],
    imports: [ BrowserModule, GenticsImageEditorModule ]
})
export class PlaygroundModule {}
 