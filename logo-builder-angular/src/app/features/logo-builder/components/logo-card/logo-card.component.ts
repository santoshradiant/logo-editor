import { Component, Input, Output, EventEmitter, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { Logo } from '../../../../core/models/logo.model';
import { LogoRendererService } from '../../../../core/services/logo-renderer.service';

@Component({
  selector: 'app-logo-card',
  templateUrl: './logo-card.component.html',
  styleUrls: ['./logo-card.component.scss']
})
export class LogoCardComponent implements AfterViewInit, OnDestroy {
  @Input() logo!: Logo;
  @Output() edit = new EventEmitter<void>();
  @Output() preview = new EventEmitter<void>();
  @Output() clone = new EventEmitter<void>();
  @Output() delete = new EventEmitter<void>();

  @ViewChild('logoCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  constructor(private logoRenderer: LogoRendererService) {}

  ngAfterViewInit(): void {
    if (this.logo && this.canvasRef) {
      setTimeout(() => {
        this.renderLogo();
      }, 0);
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

    private renderLogo(): void {
    if (!this.canvasRef || !this.logo) return;

    this.logoRenderer.initializeCanvas(this.canvasRef, 280, 200);
    this.logoRenderer.renderLogo(this.logo, this.canvasRef.nativeElement);
  }

  onEdit(): void {
    this.edit.emit();
  }

  onPreview(): void {
    this.preview.emit();
  }

  onClone(): void {
    this.clone.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 