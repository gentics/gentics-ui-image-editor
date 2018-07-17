import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {GenticsUICoreModule} from 'gentics-ui-core';
import * as Cropper from 'cropperjs';

import {GenticsImageEditorComponent} from './components/gentics-image-editor/gentics-image-editor.component';
import {GenticsImagePreviewComponent} from './components/image-preview/image-preview.component';
import {ImageCropperComponent} from './components/image-cropper/image-cropper.component';
import {ControlPanelComponent} from './components/control-panel/control-panel.component';
import {FocalPointSelectorComponent} from './components/focal-point-selector/focal-point-selector.component';
import {FocalPointTargetDirective} from './components/focal-point-selector/focal-point-target.directive';
import {CropperConstructor} from './models';
import {LanguageService} from './providers/language.service';
import {TranslatePipe} from './pipes/translate.pipe';
import {ImagePreviewWithScalesComponent} from './components/image-preview-with-scales/image-preview-with-scales.component';

export {ImageTransformParams, CropRect} from './models';
export {GenticsImageEditorComponent} from './components/gentics-image-editor/gentics-image-editor.component';
export {GenticsImagePreviewComponent} from './components/image-preview/image-preview.component';
export {ImageCropperComponent} from './components/image-cropper/image-cropper.component';
export {ControlPanelComponent} from './components/control-panel/control-panel.component';
export {FocalPointSelectorComponent} from './components/focal-point-selector/focal-point-selector.component';
export {FocalPointTargetDirective} from './components/focal-point-selector/focal-point-target.directive';
export {CropperConstructor} from './models';
export {LanguageService} from './providers/language.service';
export {TranslatePipe} from './pipes/translate.pipe';
export {ImagePreviewWithScalesComponent} from './components/image-preview-with-scales/image-preview-with-scales.component';
export {CropperService} from './providers/cropper.service';
export {FocalPointService} from './providers/focal-point.service';
export {ResizeService} from './providers/resize.service';
export {ImagePreviewService} from './providers/preview.service';

/**
 * The export behaviour of the Cropper lib leads to some issues when compiling
 * in AoT mode. This factory is designed to ensure that the correct value is
 * defined for the CropperConstuctor token.
 */
export function getCropperConstructor() {
    return Cropper && Cropper.default || Cropper;
}

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
        GenticsImagePreviewComponent,
        ImagePreviewWithScalesComponent,
        ImageCropperComponent,
        TranslatePipe
    ],
    providers: [
        LanguageService,
        { provide: CropperConstructor, useFactory: getCropperConstructor }
    ],
    exports: [
        GenticsImageEditorComponent,
        GenticsImagePreviewComponent
    ]
})
export class GenticsUIImageEditorModule {}
