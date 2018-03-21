import {ModuleWithProviders, NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from "@angular/forms";
import {GenticsUICoreModule, OverlayHostService} from 'gentics-ui-core';

import {GenticsImageEditorComponent} from './components/gentics-image-editor/gentics-image-editor.component';
import {ImagePreviewComponent} from "./components/image-preview/image-preview.component";
import {CropperService} from "./providers/cropper.service";
import {ResizeService} from "./providers/resize.service";
import {ImageCropperComponent} from "./components/image-cropper/image-cropper.component";
import {ControlPanelComponent} from "./components/control-panel/control-panel.component";
import {FocalPointSelectorComponent} from "./components/focal-point-selector/focal-point-selector.component";
import {FocalPointTargetDirective} from "./components/focal-point-selector/focal-point-target.directive";
import {FocalPointService} from "./providers/focal-point.service";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        GenticsUICoreModule
    ],
    declarations: [
        ControlPanelComponent,
        FocalPointSelectorComponent,
        FocalPointTargetDirective,
        GenticsImageEditorComponent,
        ImagePreviewComponent,
        ImageCropperComponent
    ],
    providers: [
        CropperService,
        FocalPointService,
        OverlayHostService,
        ResizeService
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
