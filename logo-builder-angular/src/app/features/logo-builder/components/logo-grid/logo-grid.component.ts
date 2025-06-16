import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Logo } from '../../../../core/models/logo.model';

@Component({
  selector: 'app-logo-grid',
  templateUrl: './logo-grid.component.html',
  styleUrls: ['./logo-grid.component.scss']
})
export class LogoGridComponent {
  @Input() logos: Logo[] | null = [];
  @Output() editLogo = new EventEmitter<Logo>();
  @Output() previewLogo = new EventEmitter<Logo>();
  @Output() cloneLogo = new EventEmitter<Logo>();
  @Output() deleteLogo = new EventEmitter<Logo>();

  onEditLogo(logo: Logo): void {
    this.editLogo.emit(logo);
  }

  onPreviewLogo(logo: Logo): void {
    this.previewLogo.emit(logo);
  }

  onCloneLogo(logo: Logo): void {
    this.cloneLogo.emit(logo);
  }

  onDeleteLogo(logo: Logo): void {
    this.deleteLogo.emit(logo);
  }

  trackByLogoId(index: number, logo: Logo): string {
    return logo.id;
  }
} 