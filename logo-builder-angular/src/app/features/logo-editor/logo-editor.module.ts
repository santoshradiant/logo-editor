import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LogoEditorComponent } from './components/logo-editor/logo-editor.component';
import { ColorPickerComponent } from './components/color-picker/color-picker.component';
import { CloudSaveStatusComponent } from './components/cloud-save-status/cloud-save-status.component';
import { FontResourcesService } from '../../core/services/font-resources.service';
import { SymbolResourcesService } from '../../core/services/symbol-resources.service';
import { ExportService } from '../../core/services/export.service';
import { UndoRedoService } from '../../core/services/undo-redo.service';
import { AutosaveService } from '../../core/services/autosave.service';

const routes: Routes = [
  {
    path: '',
    component: LogoEditorComponent
  }
];

@NgModule({
  declarations: [
    LogoEditorComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    ColorPickerComponent,
    CloudSaveStatusComponent
  ],
  providers: [
    FontResourcesService,
    SymbolResourcesService,
    ExportService,
    UndoRedoService,
    AutosaveService
  ]
})
export class LogoEditorModule { }
