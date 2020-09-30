import {ChangeDetectionStrategy, Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
    selector: 'gentics-control-panel',
    templateUrl: 'control-panel.component.html',
    styleUrls: ['control-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ControlPanelComponent {
    @Input() applyLabel = 'Apply';
    @Input() displayResetButton = false;
    @Output() cancel = new EventEmitter<void>();
    @Output() apply = new EventEmitter<void>();
    @Output() reset = new EventEmitter<void>();
}
