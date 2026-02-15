import { Component, Input, Output, EventEmitter, HostListener, ElementRef, forwardRef, OnInit } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-custom-datepicker',
  templateUrl: './custom-datepicker.component.html',
  styleUrls: ['./custom-datepicker.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomDatepickerComponent),
      multi: true
    }
  ]
})
export class CustomDatepickerComponent implements ControlValueAccessor, OnInit {
  @Input() label: string = '';
  @Input() placeholder: string = 'Select a date';
  @Output() dateChange = new EventEmitter<string | null>();

  isOpen: boolean = false;
  selectedDate: Date | null = null;
  displayDate: string = '';
  displayMonth: string = '';
  currentMonth: Date = new Date();
  weeks: Date[][] = [];
  weekdays: string[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.generateCalendar();
    this.updateDisplayMonth();
  }

  writeValue(value: any): void {
    if (value) {
      this.selectedDate = new Date(value);
      this.displayDate = formatDate(this.selectedDate, 'mediumDate', 'en-US');
      this.currentMonth = new Date(value);
      this.generateCalendar();
    } else {
      this.selectedDate = null;
      this.displayDate = '';
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Implement if needed
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.onTouched();
    if (this.isOpen) {
      // When opening, reset currentMonth to selectedDate's month if a date is selected,
      // otherwise to the current month
      this.currentMonth = this.selectedDate ? new Date(this.selectedDate) : new Date();
      this.generateCalendar();
    }
  }

  generateCalendar(): void {
    this.weeks = [];
    const startOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
    const endOfMonth = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);

    let date = new Date(startOfMonth);
    date.setDate(date.getDate() - date.getDay()); // Rewind to the first day of the week

    while (date <= endOfMonth || date.getDay() !== 0 || this.weeks.length === 0) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(date));
        date.setDate(date.getDate() + 1);
      }
      this.weeks.push(week);
    }
    
    // Update the displayed month name after generating the calendar
    this.updateDisplayMonth();
  }
  
  // generateNextCalendar removed as we're using a single calendar

  prevMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
    this.generateCalendar();
  }

  nextMonth(): void {
    this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
    this.generateCalendar();
  }
  
  updateDisplayMonth(): void {
    // Format the current month and year for display
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
    
    // Current month display
    const month = monthNames[this.currentMonth.getMonth()];
    const year = this.currentMonth.getFullYear();
    this.displayMonth = `${month} ${year}`;
  }

  selectDate(date: Date): void {
    if (!this.isDateInCurrentMonth(date)) return;
    
    // Single date selection
    this.selectedDate = date;
    this.displayDate = formatDate(this.selectedDate, 'mediumDate', 'en-US');
    const dateString = this.selectedDate.toISOString().split('T')[0];
    this.onChange(dateString);
    this.dateChange.emit(dateString);
    this.isOpen = false;
  }

  isDateInCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth() &&
           date.getFullYear() === this.currentMonth.getFullYear();
  }
  
  // isDateInNextMonth removed as we're using a single calendar

  isSelectedDate(date: Date): boolean {
    return this.selectedDate ? this.selectedDate.toDateString() === date.toDateString() : false;
  }

  // Range methods removed as we're using single date pickers

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Range methods removed as we're using single date pickers

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.onTouched();
    }
  }
}
