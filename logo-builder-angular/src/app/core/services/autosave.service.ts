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
  }

  private setupAutosave(): void {
    this.changeSubject
      .pipe(
        debounceTime(this.AUTOSAVE_DELAY),
        takeUntil(this.destroy$)
      )
      .subscribe(logoData => {
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
    this.updateState({ 
      status: 'idle', 
      hasUnsavedChanges: true 
    });
    this.changeSubject.next(logoData);
  }

  async performSave(logoData: any): Promise<void> {
    try {
      this.updateState({ status: 'saving' });
      
      // Simulate API save call - replace with actual logoService save
      await this.simulateSave(logoData);
      
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

  private async simulateSave(logoData: any): Promise<void> {
    // Replace this with actual save logic using logoService
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate success/failure
        if (Math.random() > 0.1) { // 90% success rate
          console.log('Logo autosaved:', logoData);
          resolve();
        } else {
          reject(new Error('Network error'));
        }
      }, 1000);
    });
  }

  private updateState(updates: Partial<AutosaveState>): void {
    const currentState = this.autosaveState$.value;
    this.autosaveState$.next({
      ...currentState,
      ...updates
    });
  }

  markHasUnsavedChanges(): void {
    this.updateState({ hasUnsavedChanges: true });
  }

  destroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
} 