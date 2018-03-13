import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from "@angular/forms";
import { GenticsUICoreModule, OverlayHostService } from 'gentics-ui-core';

import { GenticsImageEditorComponent } from './components/gentics-image-editor/gentics-image-editor.component';
import { ImagePreviewComponent } from "./components/image-preview/image-preview.component";
import { CropperService } from "./providers/cropper.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        GenticsUICoreModule
    ],
    declarations: [
        GenticsImageEditorComponent,
        ImagePreviewComponent
    ],
    providers: [
        OverlayHostService,
        CropperService
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
