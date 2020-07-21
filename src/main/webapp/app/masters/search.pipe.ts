import { Pipe, PipeTransform } from '@angular/core';
@Pipe({
    name: 'searchfilter'
})
export class SearchPipe implements PipeTransform {
    transform(value: any, args?: any): any {
        if (!args) {
            return value;
        }
        return value.filter(val => {
            let rVal = val.label.toLocaleLowerCase().includes(args.toLocaleLowerCase());
            return rVal;
        });
    }
}
