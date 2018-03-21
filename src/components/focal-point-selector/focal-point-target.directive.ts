import {Directive, ElementRef, Input} from '@angular/core';
import {FocalPointService} from "../../providers/focal-point.service";
import {Observable} from "rxjs/Observable";

@Directive({selector: '[genticsFocalPointTarget]'})
export class FocalPointTargetDirective {

    @Input('genticsFocalPointTarget') updateStream$: Observable<any>;

    constructor(private elementRef: ElementRef,
                private focalPointService: FocalPointService) {}

    ngOnInit(): void {
        this.focalPointService.registerTarget(this.elementRef.nativeElement);
        this.focalPointService.registerUpdateStream(this.updateStream$);
    }
}
