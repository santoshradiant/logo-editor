import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface TextUndoRedoState {
  past: string[];
  present: string;
  future: string[];
}

interface TextInputState {
  canUndo: boolean;
  canRedo: boolean;
  currentValue: string;
}

@Injectable({
  providedIn: 'root'
})
export class TextInputUndoRedoService {
  private statesMap = new Map<string, TextUndoRedoState>();
  private stateSubjectsMap = new Map<string, BehaviorSubject<TextInputState>>();
  private maxHistorySize = 50;
  private debounceTimeout = 1000; // 1 second debounce for creating undo checkpoints
  private debounceTimers = new Map<string, any>();
  private undoRedoCallbacks = new Map<string, (value: string) => void>();

  constructor() {}

  // Initialize or get undo/redo state for a specific text input
  initializeTextInput(inputId: string, initialValue: string = ''): Observable<TextInputState> {
    if (!this.statesMap.has(inputId)) {
      const initialState: TextUndoRedoState = {
        past: [],
        present: initialValue,
        future: []
      };
      this.statesMap.set(inputId, initialState);
      
      const stateSubject = new BehaviorSubject<TextInputState>({
        canUndo: false,
        canRedo: false,
        currentValue: initialValue
      });
      this.stateSubjectsMap.set(inputId, stateSubject);
    }
    
    return this.stateSubjectsMap.get(inputId)!.asObservable();
  }

  // Update text value with debouncing
  updateText(inputId: string, newValue: string, immediate: boolean = false): void {
    const state = this.statesMap.get(inputId);
    if (!state) return;

    // Clear existing debounce timer
    if (this.debounceTimers.has(inputId)) {
      clearTimeout(this.debounceTimers.get(inputId));
    }

    if (immediate) {
      this.performTextUpdate(inputId, newValue);
    } else {
      // Set debounce timer
      const timer = setTimeout(() => {
        this.performTextUpdate(inputId, newValue);
        this.debounceTimers.delete(inputId);
      }, this.debounceTimeout);
      
      this.debounceTimers.set(inputId, timer);
    }
  }

  private performTextUpdate(inputId: string, newValue: string): void {
    const state = this.statesMap.get(inputId);
    if (!state || state.present === newValue) return;

    // Add current state to past
    state.past.push(state.present);
    state.present = newValue;
    state.future = []; // Clear future when new change is made

    // Limit history size
    if (state.past.length > this.maxHistorySize) {
      state.past.shift();
    }

    this.updateStateSubject(inputId);
  }

  // Undo operation
  undo(inputId: string): string | null {
    const state = this.statesMap.get(inputId);
    if (!state || state.past.length === 0) return null;

    const previous = state.past.pop()!;
    state.future.unshift(state.present);
    state.present = previous;

    this.updateStateSubject(inputId);
    return state.present;
  }

  // Redo operation
  redo(inputId: string): string | null {
    const state = this.statesMap.get(inputId);
    if (!state || state.future.length === 0) return null;

    const next = state.future.shift()!;
    state.past.push(state.present);
    state.present = next;

    this.updateStateSubject(inputId);
    return state.present;
  }

  // Get current value
  getCurrentValue(inputId: string): string {
    const state = this.statesMap.get(inputId);
    return state ? state.present : '';
  }

  // Check if can undo
  canUndo(inputId: string): boolean {
    const state = this.statesMap.get(inputId);
    return state ? state.past.length > 0 : false;
  }

  // Check if can redo
  canRedo(inputId: string): boolean {
    const state = this.statesMap.get(inputId);
    return state ? state.future.length > 0 : false;
  }

  // Clear history for specific input
  clearHistory(inputId: string): void {
    const state = this.statesMap.get(inputId);
    if (state) {
      state.past = [];
      state.future = [];
      this.updateStateSubject(inputId);
    }
  }

  // Clean up input state
  destroyTextInput(inputId: string): void {
    if (this.debounceTimers.has(inputId)) {
      clearTimeout(this.debounceTimers.get(inputId));
      this.debounceTimers.delete(inputId);
    }
    
    this.statesMap.delete(inputId);
    const subject = this.stateSubjectsMap.get(inputId);
    if (subject) {
      subject.complete();
      this.stateSubjectsMap.delete(inputId);
    }
  }

  private updateStateSubject(inputId: string): void {
    const state = this.statesMap.get(inputId);
    const subject = this.stateSubjectsMap.get(inputId);
    
    if (state && subject) {
      subject.next({
        canUndo: state.past.length > 0,
        canRedo: state.future.length > 0,
        currentValue: state.present
      });
    }
  }

  // Handle keyboard shortcuts
  handleKeyDown(inputId: string, event: KeyboardEvent): boolean {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === 'z' && !event.shiftKey) {
        // Undo
        const undoValue = this.undo(inputId);
        if (undoValue !== null) {
          event.preventDefault();
          return true;
        }
      } else if (event.key === 'y' || (event.key === 'z' && event.shiftKey)) {
        // Redo
        const redoValue = this.redo(inputId);
        if (redoValue !== null) {
          event.preventDefault();
          return true;
        }
      }
    }
    return false;
  }
} 