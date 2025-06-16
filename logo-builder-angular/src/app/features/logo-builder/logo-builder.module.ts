import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LogoBuilderComponent } from './components/logo-builder/logo-builder.component';
import { LogoGridComponent } from './components/logo-grid/logo-grid.component';
import { LogoCardComponent } from './components/logo-card/logo-card.component';
import { LogoTemplateGalleryComponent } from './components/logo-template-gallery/logo-template-gallery.component';

const routes: Routes = [
  {
    path: '',
    component: LogoBuilderComponent
  }
];

@NgModule({
  declarations: [
    LogoBuilderComponent,
    LogoGridComponent,
    LogoCardComponent,
    LogoTemplateGalleryComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ]
})
export class LogoBuilderModule { } 