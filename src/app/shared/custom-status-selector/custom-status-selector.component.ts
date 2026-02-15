import { Component, Input, Output, EventEmitter, HostListener, ElementRef, forwardRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface StatusOption {
  value: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-custom-status-selector',
  templateUrl: './custom-status-selector.component.html',
  styleUrls: ['./custom-status-selector.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomStatusSelectorComponent),
      multi: true
    }
  ]
})
export class CustomStatusSelectorComponent implements OnInit, OnChanges, ControlValueAccessor {
  @Input() statuses: StatusOption[] = [];
  @Input() placeholder: string = 'Select a status';
  @Input() currentStatus: string | undefined;
  @Output() statusChange = new EventEmitter<string>(); // Ensure it emits a string

  isOpen: boolean = false;
  selectedStatusLabel: string | undefined;
  selectedStatusIcon: string | undefined;

  // Form control related
  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) { }

  ngOnInit(): void {
    this.updateSelectedStatusDisplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentStatus'] || changes['statuses']) {
      this.updateSelectedStatusDisplay();
    }
  }

  private updateSelectedStatusDisplay(): void {
    const selected = this.statuses.find(s => s.value === this.currentStatus);
    this.selectedStatusLabel = selected ? selected.label : this.placeholder;
    this.selectedStatusIcon = selected ? selected.icon : undefined;
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  selectStatus(status: StatusOption): void {
    this.currentStatus = status.value;
    this.selectedStatusLabel = status.label;
    this.selectedStatusIcon = status.icon;
    this.statusChange.emit(status.value);
    this.onChange(status.value);
    this.onTouched();
    this.isOpen = false;
  }

  // Close dropdown when clicking outside
  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // ControlValueAccessor methods
  writeValue(value: any): void {
    this.currentStatus = value;
    this.updateSelectedStatusDisplay();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Not implemented for this component, but required by interface
  }
}
