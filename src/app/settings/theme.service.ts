import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type FontSize = 'small' | 'medium' | 'large';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly FONT_SIZE_KEY = 'hotelmart_font_size';
  private fontSizeSubject = new BehaviorSubject<FontSize>(this.getSavedFontSize());

  fontSize$ = this.fontSizeSubject.asObservable();

  constructor() {
    // Apply saved font size on service initialization
    this.applyFontSize(this.fontSizeSubject.value);
  }

  /**
   * Get the saved font size from localStorage
   */
  private getSavedFontSize(): FontSize {
    const saved = localStorage.getItem(this.FONT_SIZE_KEY);
    if (saved && ['small', 'medium', 'large'].includes(saved)) {
      return saved as FontSize;
    }
    return 'medium'; // Default
  }

  /**
   * Get current font size
   */
  getCurrentFontSize(): FontSize {
    return this.fontSizeSubject.value;
  }

  /**
   * Set font size and persist to localStorage
   */
  setFontSize(size: FontSize): void {
    localStorage.setItem(this.FONT_SIZE_KEY, size);
    this.fontSizeSubject.next(size);
    this.applyFontSize(size);
  }

  /**
   * Apply font size to document root (html element)
   */
  private applyFontSize(size: FontSize): void {
    // Remove existing font size classes from html element
    document.documentElement.classList.remove('font-size-small', 'font-size-medium', 'font-size-large');

    // Add new font size class to html element
    document.documentElement.classList.add(`font-size-${size}`);
  }

  /**
   * Get font size display name
   */
  getFontSizeLabel(size: FontSize): string {
    const labels = {
      small: 'Small',
      medium: 'Medium (Default)',
      large: 'Large'
    };
    return labels[size];
  }

  /**
   * Get font size description
   */
  getFontSizeDescription(size: FontSize): string {
    const descriptions = {
      small: 'Compact view with smaller text',
      medium: 'Standard size, recommended for most users',
      large: 'Larger text for better readability'
    };
    return descriptions[size];
  }
}
