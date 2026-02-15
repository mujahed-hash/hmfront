import { Component, Input, Output, EventEmitter, HostListener, ElementRef, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface CustomSelectOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-custom-select',
  templateUrl: './custom-select.component.html',
  styleUrls: ['./custom-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CustomSelectComponent),
      multi: true
    }
  ]
})
export class CustomSelectComponent implements ControlValueAccessor {
  @Input() options: CustomSelectOption[] = [];
  @Input() placeholder: string = 'Select an option';
  @Input() label: string = ''; // Added for consistent styling with Angular Material
  @Output() selectionChange = new EventEmitter<string>();

  isOpen: boolean = false;
  selectedValue: string | null = null;
  selectedLabel: string | null = null;

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private el: ElementRef) { }

  writeValue(value: any): void {
    if (value !== undefined && value !== null) {
      this.selectedValue = value;
      this.selectedLabel = this.options.find(option => option.value === value)?.label || null;
    }
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Not implementing disabled state for now, but can be added later if needed
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.onTouched();
  }

  selectOption(option: CustomSelectOption): void {
    this.selectedValue = option.value;
    this.selectedLabel = option.label;
    this.onChange(option.value);
    this.selectionChange.emit(option.value);
    this.isOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
      this.onTouched();
    }
  }
}
