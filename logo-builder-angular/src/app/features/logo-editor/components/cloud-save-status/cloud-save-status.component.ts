import { Component, Input, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Observable, Subscription } from 'rxjs'
import { AutosaveService, AutosaveState } from '../../../../core/services/autosave.service'

@Component({
  selector: 'app-cloud-save-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cloud-save-status.component.html',
  styleUrl: './cloud-save-status.component.scss'
})
export class CloudSaveStatusComponent implements OnInit, OnDestroy {
  @Input() showStatusText: boolean = true
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'

  autosaveState: AutosaveState = {
    status: 'idle',
    hasUnsavedChanges: true
  }

  private subscription?: Subscription

  constructor(
    private autosaveService: AutosaveService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('CloudSaveStatusComponent initialized');
    this.subscription = this.autosaveService.getAutosaveState().subscribe((state) => {
      console.log('CloudSaveStatusComponent received state update:', state);
      this.autosaveState = state
      // Force change detection to ensure UI updates
      this.cdr.detectChanges();
    })
  }

  ngOnDestroy(): void {
    console.log('CloudSaveStatusComponent destroying');
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  get shouldShowStatus(): boolean {
    // Always show the status - start with unsaved changes indication
    return true
  }

  getTooltipText(): string {
    switch (this.autosaveState.status) {
      case 'saving':
        return 'Saving changes...'
      case 'saved':
        return `Saved ${
          this.autosaveState.lastSaved ? new Date(this.autosaveState.lastSaved).toLocaleTimeString() : ''
        }`
      case 'error':
        return 'Failed to save changes'
      case 'idle':
      default:
        return this.autosaveState.hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved'
    }
  }

  getStatusClass(): string {
    return `status-${this.autosaveState.status}`;
  }

  getStatusText(): string {
    switch (this.autosaveState.status) {
      case 'saving':
        return 'Saving...'
      case 'saved':
        return 'Saved'
      case 'error':
        return 'Save failed'
      case 'idle':
      default:
        return this.autosaveState.hasUnsavedChanges ? 'Unsaved changes' : 'All saved'
    }
  }
}
