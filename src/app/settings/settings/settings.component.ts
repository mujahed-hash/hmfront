import { Component, OnInit } from '@angular/core';
import { ThemeService, FontSize } from '../theme.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  currentFontSize: FontSize = 'medium';
  fontSizes: FontSize[] = ['small', 'medium', 'large'];

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentFontSize = this.themeService.getCurrentFontSize();
  }

  /**
   * Change font size
   */
  onFontSizeChange(size: FontSize): void {
    this.currentFontSize = size;
    this.themeService.setFontSize(size);
  }

  /**
   * Get label for font size
   */
  getFontSizeLabel(size: FontSize): string {
    return this.themeService.getFontSizeLabel(size);
  }

  /**
   * Get description for font size
   */
  getFontSizeDescription(size: FontSize): string {
    return this.themeService.getFontSizeDescription(size);
  }

  /**
   * Go back to previous page
   */
  goBack(): void {
    this.router.navigate(['/home']);
  }
}
