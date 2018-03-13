import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GenticsUICoreModule } from 'gentics-ui-core';

import { GenticsImageEditorComponent } from './gentics-image-editor.component';

@NgModule({
    imports: [
        CommonModule,
        GenticsUICoreModule
    ],
    declarations: [
        GenticsImageEditorComponent
    ],
    exports: [
        GenticsImageEditorComponent
    ]
})
export class GenticsImageEditorModule {
    static forRoot(): ModuleWithProviders {
        return {
            ngModule: GenticsImageEditorModule
        };
    }
}
