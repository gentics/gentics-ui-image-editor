import {Directive, ElementRef, Input, OnInit} from '@angular/core';
import {FocalPointService} from '../../providers/focal-point.service';
import {Observable} from 'rxjs';

@Directive({selector: '[genticsFocalPointTarget]'})
export class FocalPointTargetDirective implements OnInit {

    // tslint:disable-next-line
    @Input('genticsFocalPointTarget') updateStream$: Observable<any>;

    constructor(private elementRef: ElementRef,
                private focalPointService: FocalPointService) {}

    ngOnInit(): void {
        this.focalPointService.registerTarget(this.elementRef.nativeElement);
        this.focalPointService.registerUpdateStream(this.updateStream$);
    }
}
