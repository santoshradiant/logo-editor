import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, BehaviorSubject, combineLatest, takeUntil, Subject } from 'rxjs';
import { map, distinctUntilChanged } from 'rxjs/operators';

import { 
  LogoEditorState, 
  BrandConfiguration, 
  SloganConfiguration, 
  IconConfiguration, 
  ColorConfiguration,
  EditorTabType,
  LogoEditorActions,
  NounIconItem,
  UndoRedoCommand
} from '../../../../core/models/logo-editor.interface';
import { LogoEditorHelper } from '../../../../core/models/logo-editor.helper';
import { LogoService } from '../../../../core/services/logo.service';
import { UndoRedoService } from '../../../../core/services/undo-redo.service';
import { AutosaveService } from '../../../../core/services/autosave.service';
import { Logo } from '../../../../core/models/logo.model';

@Component({
  selector: 'lz-logo-editor-container',
  templateUrl: './logo-editor-container.component.html',
  styleUrls: ['./logo-editor-container.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoEditorContainerComponent implements OnInit, OnDestroy, LogoEditorActions {
  private readonly destroy$ = new Subject<void>();
  
  // Injected services
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly logoService = inject(LogoService);
  private readonly undoRedoService = inject(UndoRedoService);
  private readonly autosaveService = inject(AutosaveService);

  // State management
  private readonly stateSubject = new BehaviorSubject<LogoEditorState>({
    isLoading: false,
    activeTab: EditorTabType.BRAND,
    brandName: '',
    sloganText: '',
    hasUnsavedChanges: false,
    canUndo: false,
    canRedo: false
  });

  private readonly brandConfigSubject = new BehaviorSubject<BrandConfiguration>(
    LogoEditorHelper.generateDefaultBrandConfiguration()
  );

  private readonly sloganConfigSubject = new BehaviorSubject<SloganConfiguration>(
    LogoEditorHelper.generateDefaultSloganConfiguration()
  );

  private readonly iconConfigSubject = new BehaviorSubject<IconConfiguration>(
    LogoEditorHelper.generateDefaultIconConfiguration()
  );

  private readonly colorConfigSubject = new BehaviorSubject<ColorConfiguration>(
    LogoEditorHelper.generateDefaultColorConfiguration()
  );

  // Public observables
  readonly state$ = this.stateSubject.asObservable();
  readonly brandConfig$ = this.brandConfigSubject.asObservable();
  readonly sloganConfig$ = this.sloganConfigSubject.asObservable();
  readonly iconConfig$ = this.iconConfigSubject.asObservable();
  readonly colorConfig$ = this.colorConfigSubject.asObservable();

  // Combined view model
  readonly viewModel$ = combineLatest([
    this.state$,
    this.brandConfig$,
    this.sloganConfig$,
    this.iconConfig$,
    this.colorConfig$
  ]).pipe(
    map(([state, brandConfig, sloganConfig, iconConfig, colorConfig]) => ({
      state,
      brandConfig,
      sloganConfig,
      iconConfig,
      colorConfig
    })),
    distinctUntilChanged((prev, curr) => 
      LogoEditorHelper.isConfigurationEqual(prev, curr)
    )
  );

  private currentLogoId: string | null = null;
  private currentLogo: Logo | null = null;

  ngOnInit(): void {
    this.initializeEditor();
    this.setupUndoRedo();
    this.setupAutosave();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // LogoEditorActions implementation
  updateBrandName(name: string): void {
    const oldConfig = this.brandConfigSubject.getValue();
    const newConfig = { ...oldConfig, name };
    
    this.executeCommand({
      execute: () => {
        this.brandConfigSubject.next(newConfig);
        this.updateState({ brandName: name, hasUnsavedChanges: true });
      },
      undo: () => {
        this.brandConfigSubject.next(oldConfig);
        this.updateState({ brandName: oldConfig.name, hasUnsavedChanges: true });
      },
      description: 'Change brand name'
    });
  }

  updateSloganText(text: string): void {
    const oldConfig = this.sloganConfigSubject.getValue();
    const newConfig = { ...oldConfig, text };
    
    this.executeCommand({
      execute: () => {
        this.sloganConfigSubject.next(newConfig);
        this.updateState({ sloganText: text, hasUnsavedChanges: true });
      },
      undo: () => {
        this.sloganConfigSubject.next(oldConfig);
        this.updateState({ sloganText: oldConfig.text, hasUnsavedChanges: true });
      },
      description: 'Change slogan text'
    });
  }

  selectFont(fontFamily: string): void {
    const oldConfig = this.brandConfigSubject.getValue();
    const newConfig = { ...oldConfig, selectedFont: fontFamily };
    
    this.executeCommand({
      execute: () => {
        this.brandConfigSubject.next(newConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      undo: () => {
        this.brandConfigSubject.next(oldConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      description: `Change font to ${fontFamily}`
    });
  }

  selectIcon(icon: NounIconItem): void {
    const oldConfig = this.iconConfigSubject.getValue();
    const newConfig = { ...oldConfig, selectedIcon: icon };
    
    this.executeCommand({
      execute: () => {
        this.iconConfigSubject.next(newConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      undo: () => {
        this.iconConfigSubject.next(oldConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      description: `Select icon ${icon.name}`
    });
  }

  updateColorScheme(schemeIndex: number): void {
    const oldConfig = this.colorConfigSubject.getValue();
    const newConfig = { ...oldConfig, selectedSchemeIndex: schemeIndex };
    
    this.executeCommand({
      execute: () => {
        this.colorConfigSubject.next(newConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      undo: () => {
        this.colorConfigSubject.next(oldConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      description: `Change color scheme to ${schemeIndex}`
    });
  }

  executeUndo(): void {
    this.undoRedoService.undo();
  }

  executeRedo(): void {
    this.undoRedoService.redo();
  }

  saveChanges(): void {
    if (!this.currentLogoId) return;

    this.updateState({ isLoading: true });
    
    const logoData = this.buildLogoData();
    
    this.logoService.updateLogo(this.currentLogoId, logoData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (updatedLogo) => {
          this.currentLogo = updatedLogo;
          this.updateState({ 
            isLoading: false, 
            hasUnsavedChanges: false 
          });
        },
        error: (error) => {
          console.error('Failed to save logo:', error);
          this.updateState({ isLoading: false });
        }
      });
  }

  exportLogo(format: string): void {
    if (!this.currentLogo) return;

    this.updateState({ isLoading: true });
    
    // Implementation would depend on the export service
    console.log(`Exporting logo in ${format} format`);
    
    setTimeout(() => {
      this.updateState({ isLoading: false });
    }, 2000);
  }

  // Public methods for presentation components
  setActiveTab(tab: EditorTabType): void {
    this.updateState({ activeTab: tab });
  }

  updateBrandConfig(config: Partial<BrandConfiguration>): void {
    const oldConfig = this.brandConfigSubject.getValue();
    const newConfig = { ...oldConfig, ...config };
    
    this.executeCommand({
      execute: () => {
        this.brandConfigSubject.next(newConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      undo: () => {
        this.brandConfigSubject.next(oldConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      description: 'Update brand configuration'
    });
  }

  updateSloganConfig(config: Partial<SloganConfiguration>): void {
    const oldConfig = this.sloganConfigSubject.getValue();
    const newConfig = { ...oldConfig, ...config };
    
    this.executeCommand({
      execute: () => {
        this.sloganConfigSubject.next(newConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      undo: () => {
        this.sloganConfigSubject.next(oldConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      description: 'Update slogan configuration'
    });
  }

  updateIconConfig(config: Partial<IconConfiguration>): void {
    const oldConfig = this.iconConfigSubject.getValue();
    const newConfig = { ...oldConfig, ...config };
    
    this.executeCommand({
      execute: () => {
        this.iconConfigSubject.next(newConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      undo: () => {
        this.iconConfigSubject.next(oldConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      description: 'Update icon configuration'
    });
  }

  updateColorConfig(config: Partial<ColorConfiguration>): void {
    const oldConfig = this.colorConfigSubject.getValue();
    const newConfig = { ...oldConfig, ...config };
    
    this.executeCommand({
      execute: () => {
        this.colorConfigSubject.next(newConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      undo: () => {
        this.colorConfigSubject.next(oldConfig);
        this.updateState({ hasUnsavedChanges: true });
      },
      description: 'Update color configuration'
    });
  }

  navigateBack(): void {
    this.router.navigate(['/logo-builder']);
  }

  private initializeEditor(): void {
    const logoId = this.route.snapshot.paramMap.get('id');
    
    if (logoId) {
      this.currentLogoId = logoId;
      this.loadLogo(logoId);
    } else {
      this.createNewLogo();
    }
  }

  private loadLogo(id: string): void {
    this.updateState({ isLoading: true });
    
    this.logoService.getLogoById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (logo) => {
          this.currentLogo = logo;
          this.populateFromLogo(logo);
          this.updateState({ isLoading: false });
        },
        error: (error) => {
          console.error('Failed to load logo:', error);
          this.updateState({ isLoading: false });
          this.router.navigate(['/logo-builder']);
        }
      });
  }

  private createNewLogo(): void {
    // Set default values
    this.updateState({ 
      brandName: '',
      sloganText: '',
      hasUnsavedChanges: false 
    });
  }

  private populateFromLogo(logo: Logo): void {
    // Populate configurations from logo data
    if (logo.brandText) {
      this.updateState({ brandName: logo.brandText });
      this.brandConfigSubject.next({
        ...this.brandConfigSubject.getValue(),
        name: logo.brandText
      });
    }

    if (logo.tagline) {
      this.updateState({ sloganText: logo.tagline });
      this.sloganConfigSubject.next({
        ...this.sloganConfigSubject.getValue(),
        text: logo.tagline
      });
    }

    // Additional logo property mappings would go here
  }

  private setupUndoRedo(): void {
    this.undoRedoService.state$
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.updateState({
          canUndo: state.canUndo,
          canRedo: state.canRedo
        });
      });
  }

  private setupAutosave(): void {
    this.autosaveService.initialize(
      () => this.buildLogoData(),
      (data) => this.saveChanges(),
      this.destroy$
    );
  }

  private executeCommand(command: UndoRedoCommand): void {
    this.undoRedoService.executeCommand(command);
  }

  private updateState(partialState: Partial<LogoEditorState>): void {
    const currentState = this.stateSubject.getValue();
    this.stateSubject.next({ ...currentState, ...partialState });
  }

  private buildLogoData(): any {
    const brandConfig = this.brandConfigSubject.getValue();
    const sloganConfig = this.sloganConfigSubject.getValue();
    const iconConfig = this.iconConfigSubject.getValue();
    const colorConfig = this.colorConfigSubject.getValue();

    return {
      brandText: brandConfig.name,
      tagline: sloganConfig.text,
      brandFont: {
        family: brandConfig.selectedFont,
        size: brandConfig.fontSize,
        weight: brandConfig.isBold ? 700 : 400,
        style: brandConfig.isItalic ? 'italic' : 'normal'
      },
      // Additional data mapping would go here
    };
  }
} 