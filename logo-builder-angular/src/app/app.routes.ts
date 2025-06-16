import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/logo-builder',
    pathMatch: 'full'
  },
  {
    path: 'logo-builder',
    loadChildren: () => import('./features/logo-builder/logo-builder.module').then(m => m.LogoBuilderModule)
  },
  {
    path: 'editor/:id',
    loadChildren: () => import('./features/logo-editor/logo-editor.module').then(m => m.LogoEditorModule)
  },
  {
    path: 'feature-test',
    loadComponent: () => import('./features/logo-editor/components/feature-test/feature-test.component').then(c => c.FeatureTestComponent)
  },
  {
    path: 'preview/:id',
    loadChildren: () => import('./features/logo-preview/logo-preview.module').then(m => m.LogoPreviewModule)
  },
  {
    path: '**',
    redirectTo: '/logo-builder'
  }
];
