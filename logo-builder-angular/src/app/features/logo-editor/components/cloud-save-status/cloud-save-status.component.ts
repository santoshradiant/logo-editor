import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subscription } from 'rxjs';
import { AutosaveService, AutosaveState } from '../../../../core/services/autosave.service';

@Component({
  selector: 'app-cloud-save-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="cloud-save-status" 
         [class]="'status-' + autosaveState.status" 
         *ngIf="shouldShowStatus"
         [title]="getTooltipText()">
      <div class="cloud-icon-wrapper" [class.spinning]="autosaveState.status === 'saving'">
        <!-- Simple cloud icon with checkmark for saved state -->
        <svg *ngIf="autosaveState.status === 'saved'" 
             class="cloud-icon saved" 
             width="16" height="16" 
             viewBox="0 0 16 16" 
             fill="currentColor" 
             xmlns="http://www.w3.org/2000/svg">
          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
          <path d="M10.854 6.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 8.793l2.646-2.647a.5.5 0 0 1 .708 0z"/>
        </svg>

        <!-- Simple cloud icon with spinner for saving state -->
        <svg *ngIf="autosaveState.status === 'saving'" 
             class="cloud-icon saving" 
             width="16" height="16" 
             viewBox="0 0 16 16" 
             fill="currentColor" 
             xmlns="http://www.w3.org/2000/svg">
          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
          <circle cx="8" cy="8" r="2" stroke="white" stroke-width="1" fill="none" opacity="0.8">
            <animate attributeName="r" values="1;2;1" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>

        <!-- Simple cloud icon with X for error state -->
        <svg *ngIf="autosaveState.status === 'error'" 
             class="cloud-icon error" 
             width="16" height="16" 
             viewBox="0 0 16 16" 
             fill="currentColor" 
             xmlns="http://www.w3.org/2000/svg">
          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
          <path d="M11.854 4.146a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708-.708l7-7a.5.5 0 0 1 .708 0z"/>
          <path d="M4.146 4.146a.5.5 0 0 0 0 .708l7 7a.5.5 0 0 0 .708-.708l-7-7a.5.5 0 0 0-.708 0z"/>
        </svg>

        <!-- Simple cloud icon for idle/unsaved state -->
        <svg *ngIf="autosaveState.status === 'idle'" 
             class="cloud-icon unsaved" 
             width="16" height="16" 
             viewBox="0 0 16 16" 
             fill="currentColor" 
             xmlns="http://www.w3.org/2000/svg">
          <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383zm.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"/>
          <circle cx="8" cy="8" r="1" fill="white" opacity="0.7"/>
        </svg>
      </div>
      
      <div class="status-text" *ngIf="showStatusText">
        <span *ngIf="autosaveState.status === 'saving'">Saving...</span>
        <span *ngIf="autosaveState.status === 'saved'">Saved</span>
        <span *ngIf="autosaveState.status === 'error'">Save failed</span>
        <span *ngIf="autosaveState.status === 'idle'">{{autosaveState.hasUnsavedChanges ? 'Unsaved changes' : 'All saved'}}</span>
      </div>
    </div>
  `,
  styles: [`
    .cloud-save-status {
      display: flex !important;
      align-items: center;
      gap: 6px;
      padding: 0;
      background: transparent;
      border: none;
      box-shadow: none;
      backdrop-filter: none;
      border-radius: 0;
      transition: all 0.3s ease;
      visibility: visible !important;
    }

    .cloud-save-status:hover {
      background: rgba(255, 255, 255, 0.98);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .cloud-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }

    .cloud-icon {
      transition: all 0.3s ease;
    }

    .cloud-icon.saved {
      color: #22c55e; /* Green */
    }

    .cloud-icon.saving {
      color: #6b7280; /* Gray */
    }

    .cloud-icon.error {
      color: #ef4444; /* Red */
    }

    .cloud-icon.unsaved {
      color: #6b7280; /* Gray */
    }

    .status-text {
      font-size: 12px;
      font-weight: 500;
      line-height: 1;
      white-space: nowrap;
    }

    .status-saved .status-text {
      color: #22c55e;
    }

    .status-saving .status-text {
      color: #3b82f6;
    }

    .status-error .status-text {
      color: #ef4444;
    }

    .status-idle .status-text {
      color: #f59e0b;
    }

    /* Spinning animation for saving state */
    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    /* Hide component when no status to show */
    .cloud-save-status.ng-hide {
      display: none;
    }
  `]
})
export class CloudSaveStatusComponent implements OnInit, OnDestroy {
  @Input() showStatusText: boolean = true;
  @Input() position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right';

  autosaveState: AutosaveState = {
    status: 'idle',
    hasUnsavedChanges: true
  };

  private subscription?: Subscription;

  constructor(private autosaveService: AutosaveService) {}

  ngOnInit(): void {
    this.subscription = this.autosaveService.getAutosaveState().subscribe(
      state => {
        this.autosaveState = state;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  get shouldShowStatus(): boolean {
    // Always show the status - start with unsaved changes indication
    return true;
  }

  getTooltipText(): string {
    switch (this.autosaveState.status) {
      case 'saving':
        return 'Saving changes...';
      case 'saved':
        return `Saved ${this.autosaveState.lastSaved ? new Date(this.autosaveState.lastSaved).toLocaleTimeString() : ''}`;
      case 'error':
        return 'Failed to save changes';
      case 'idle':
      default:
        return this.autosaveState.hasUnsavedChanges ? 'Unsaved changes' : 'All changes saved';
    }
  }
} 