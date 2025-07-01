import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, debounceTime, takeUntil } from 'rxjs';
import { LogoService } from './logo.service';

export interface AutosaveState {
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved?: Date;
  hasUnsavedChanges: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AutosaveService {
  private readonly AUTOSAVE_DELAY = 2000; // 2 seconds delay
  private readonly SAVE_SUCCESS_DISPLAY_TIME = 2000; // Show "saved" for 2 seconds

  private autosaveState$ = new BehaviorSubject<AutosaveState>({
    status: 'idle',
    hasUnsavedChanges: true
  });

  private changeSubject = new Subject<any>();
  private destroy$ = new Subject<void>();

  constructor(private logoService: LogoService) {
    this.setupAutosave();
    console.log('AutosaveService initialized');
  }

  private setupAutosave(): void {
    console.log('Setting up autosave with delay:', this.AUTOSAVE_DELAY);
    this.changeSubject
      .pipe(
        debounceTime(this.AUTOSAVE_DELAY),
        takeUntil(this.destroy$)
      )
      .subscribe(logoData => {
        console.log('Autosave triggered with data:', logoData);
        this.performSave(logoData);
      });
  }

  getAutosaveState(): Observable<AutosaveState> {
    return this.autosaveState$.asObservable();
  }

  getCurrentState(): AutosaveState {
    return this.autosaveState$.value;
  }

  triggerSave(logoData: any): void {
    console.log('triggerSave called with data:', logoData);
    this.updateState({ 
      status: 'idle', 
      hasUnsavedChanges: true 
    });
    this.changeSubject.next(logoData);
  }

  async performSave(logoData: any): Promise<void> {
    console.log('performSave called with data:', logoData);
    try {
      this.updateState({ status: 'saving' });
      console.log('Starting save operation...');
      
      // Use actual save functionality through logoService
      await this.saveLogoData(logoData);
      
      console.log('Save operation completed successfully');
      this.updateState({ 
        status: 'saved', 
        lastSaved: new Date(),
        hasUnsavedChanges: false 
      });

      // Reset to idle after showing "saved" status
      setTimeout(() => {
        if (this.autosaveState$.value.status === 'saved') {
          this.updateState({ status: 'idle' });
        }
      }, this.SAVE_SUCCESS_DISPLAY_TIME);

    } catch (error) {
      console.error('Autosave failed:', error);
      this.updateState({ status: 'error' });
      
      // Reset to idle after showing error
      setTimeout(() => {
        if (this.autosaveState$.value.status === 'error') {
          this.updateState({ status: 'idle' });
        }
      }, this.SAVE_SUCCESS_DISPLAY_TIME);
    }
  }

  private async saveLogoData(logoData: any): Promise<void> {
    console.log('Saving logo data to local storage and service:', logoData);
    
    // Save to localStorage as a backup
    try {
      const logoDataString = JSON.stringify(logoData);
      localStorage.setItem('autosave_logo_data', logoDataString);
      localStorage.setItem('autosave_timestamp', new Date().toISOString());
      console.log('Logo data saved to localStorage');
    } catch (localStorageError) {
      console.warn('Failed to save to localStorage:', localStorageError);
    }

    // If we have a logo ID, try to save through the service
    if (logoData.id) {
      try {
        await this.logoService.updateLogo(logoData.id, logoData).toPromise();
        console.log('Logo data saved through logoService');
      } catch (serviceError) {
        console.warn('Failed to save through logoService, but localStorage backup exists:', serviceError);
        // Don't throw error here, localStorage backup is sufficient for autosave
      }
    } else {
      console.log('No logo ID found, only saving to localStorage');
    }
  }

  private updateState(updates: Partial<AutosaveState>): void {
    const currentState = this.autosaveState$.value;
    const newState = {
      ...currentState,
      ...updates
    };
    console.log('Updating autosave state:', newState);
    this.autosaveState$.next(newState);
  }

  markHasUnsavedChanges(): void {
    this.updateState({ hasUnsavedChanges: true });
  }

  getLastSavedData(): any {
    try {
      const savedData = localStorage.getItem('autosave_logo_data');
      const timestamp = localStorage.getItem('autosave_timestamp');
      if (savedData && timestamp) {
        return {
          data: JSON.parse(savedData),
          timestamp: new Date(timestamp)
        };
      }
    } catch (error) {
      console.error('Failed to retrieve saved data:', error);
    }
    return null;
  }

  clearSavedData(): void {
    localStorage.removeItem('autosave_logo_data');
    localStorage.removeItem('autosave_timestamp');
    console.log('Cleared autosave data from localStorage');
  }

  destroy(): void {
    console.log('AutosaveService destroying');
    this.destroy$.next();
    this.destroy$.complete();
  }
} 