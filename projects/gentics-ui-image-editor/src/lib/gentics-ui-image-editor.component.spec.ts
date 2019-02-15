import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GenticsUiImageEditorComponent } from './gentics-ui-image-editor.component';

describe('GenticsUiImageEditorComponent', () => {
  let component: GenticsUiImageEditorComponent;
  let fixture: ComponentFixture<GenticsUiImageEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GenticsUiImageEditorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GenticsUiImageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
