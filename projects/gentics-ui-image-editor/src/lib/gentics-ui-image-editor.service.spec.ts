import { TestBed } from '@angular/core/testing';

import { GenticsUiImageEditorService } from './gentics-ui-image-editor.service';

describe('GenticsUiImageEditorService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: GenticsUiImageEditorService = TestBed.get(GenticsUiImageEditorService);
    expect(service).toBeTruthy();
  });
});
