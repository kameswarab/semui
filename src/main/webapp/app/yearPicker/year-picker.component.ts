import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit } from '@angular/core';

@Component({
    selector: 'year-picker',
    templateUrl: './year-picker.component.html',
    styleUrls: ['./year-picker.component.css']
})
export class YearPickerComponent implements OnInit, AfterViewInit {
    years: any[] = [];
    // Allow the input to be disabled, and when it is make it somewhat transparent.
    @Input() disabled = false;
    @Input() mask = 'yyyy';
    @Input() data: any;

    @Output() valueChange = new EventEmitter();

    constructor() {}

    ngOnInit() {}
    ngAfterViewInit(): void {
        let now = new Date();
        // current year
        let thisYear = now.getFullYear();
        if (this.data == null) {
            this.data = thisYear;
        }
        this.valueChanged();
        this.generateYears(this.data - 10);
    }

    valueChanged() {
        this.valueChange.emit(this.data);
    }

    calenderClick(year) {
        if (year && !isNaN(year)) {
            this.generateYears(year - 10);
        } else {
            let now = new Date();
            year = now.getFullYear();

            this.generateYears(year - 10);
        }
    }

    generateYears(startYear: number) {
        if (startYear <= 0) {
            startYear = 1;
        }
        this.years = [];
        for (let i = 0; i < 20; i++) {
            this.years.push(startYear + i);
        }
    }

    selectYear(year) {
        this.data = year;
        this.valueChanged();
    }

    nextYears($event: any) {
        $event.stopPropagation();
        this.generateYears(this.years[19] + 1);
    }
    prevYears($event: any) {
        $event.stopPropagation();
        this.generateYears(this.years[0] - 20);
    }
}
