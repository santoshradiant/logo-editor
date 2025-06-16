import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

import { LogoPreviewComponent } from './components/logo-preview/logo-preview.component';

const routes: Routes = [
  {
    path: '',
    component: LogoPreviewComponent
  }
];

@NgModule({
  declarations: [
    LogoPreviewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class LogoPreviewModule { } 