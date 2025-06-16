import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-logo-template-gallery',
  templateUrl: './logo-template-gallery.component.html',
  styleUrls: ['./logo-template-gallery.component.scss']
})
export class LogoTemplateGalleryComponent implements OnInit {
  templates = [
    { id: 1, name: 'Business Template', category: 'business' },
    { id: 2, name: 'Tech Template', category: 'technology' },
    { id: 3, name: 'Creative Template', category: 'creative' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  selectTemplate(template: any): void {
    console.log('Selected template:', template);
  }
} 