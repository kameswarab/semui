import { Directive, Input, Output, EventEmitter } from '@angular/core';

@Directive({
    selector: '[ngInit]'
})
export class NgInitDirective {
    @Output('ngInit') initEvent: EventEmitter<any> = new EventEmitter();

    ngOnInit() {
        setTimeout(() => this.initEvent.emit(), 10);
    }
}
