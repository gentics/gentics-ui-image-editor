/**
 * This is only for local test
 */
import {BrowserModule} from '@angular/platform-browser';
import {Component, NgModule, ViewEncapsulation} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {GenticsImageEditorModule} from '../src/index';

declare const require: any;

require('./index.scss');

@Component({
    selector: 'app',
    template: `<gentics-image-editor></gentics-image-editor>`
})
class AppComponent {}

@NgModule({
    bootstrap: [ AppComponent ],
    declarations: [ AppComponent ],
    imports: [ BrowserModule, GenticsImageEditorModule ]
})
class AppModule {}

platformBrowserDynamic().bootstrapModule(AppModule);
