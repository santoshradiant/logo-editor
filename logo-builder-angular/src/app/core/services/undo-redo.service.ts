import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UndoRedoCommand {
  execute(): void;
  undo(): void;
  description: string;
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  currentPosition: number;
  totalCommands: number;
  lastCommand?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UndoRedoService {
  private undoStack: UndoRedoCommand[] = [];
  private redoStack: UndoRedoCommand[] = [];
  private maxHistorySize = 50;
  
  private stateSubject = new BehaviorSubject<UndoRedoState>({
    canUndo: false,
    canRedo: false,
    currentPosition: 0,
    totalCommands: 0
  });
  
  public state$ = this.stateSubject.asObservable();

  constructor() {}

  // Execute a command and add it to the undo stack
  executeCommand(command: UndoRedoCommand): void {
    // Execute the command
    command.execute();
    
    // Add to undo stack
    this.undoStack.push(command);
    
    // Clear redo stack since we've executed a new command
    this.redoStack = [];
    
    // Limit history size
    if (this.undoStack.length > this.maxHistorySize) {
      this.undoStack.shift();
    }
    
    this.updateState();
  }

  // Undo the last command
  undo(): boolean {
    if (this.undoStack.length === 0) {
      return false;
    }
    
    const command = this.undoStack.pop()!;
    command.undo();
    this.redoStack.push(command);
    
    this.updateState();
    return true;
  }

  // Redo the last undone command
  redo(): boolean {
    if (this.redoStack.length === 0) {
      return false;
    }
    
    const command = this.redoStack.pop()!;
    command.execute();
    this.undoStack.push(command);
    
    this.updateState();
    return true;
  }

  // Clear all history
  clear(): void {
    this.undoStack = [];
    this.redoStack = [];
    this.updateState();
  }

  // Get current state
  getState(): UndoRedoState {
    return this.stateSubject.value;
  }

  // Update the state and notify subscribers
  private updateState(): void {
    const state: UndoRedoState = {
      canUndo: this.undoStack.length > 0,
      canRedo: this.redoStack.length > 0,
      currentPosition: this.undoStack.length,
      totalCommands: this.undoStack.length + this.redoStack.length,
      lastCommand: this.undoStack.length > 0 ? this.undoStack[this.undoStack.length - 1].description : undefined
    };
    
    this.stateSubject.next(state);
  }

  // Get undo history for debugging
  getUndoHistory(): string[] {
    return this.undoStack.map(cmd => cmd.description);
  }

  // Get redo history for debugging
  getRedoHistory(): string[] {
    return this.redoStack.map(cmd => cmd.description);
  }
}

// Specific logo editing commands
export class LogoPropertyChangeCommand implements UndoRedoCommand {
  constructor(
    private target: any,
    private property: string,
    private newValue: any,
    private oldValue: any,
    public description: string
  ) {}

  execute(): void {
    this.target[this.property] = this.newValue;
  }

  undo(): void {
    this.target[this.property] = this.oldValue;
  }
}

export class LogoTextChangeCommand implements UndoRedoCommand {
  constructor(
    private logoService: any,
    private newText: string,
    private oldText: string
  ) {}

  get description(): string {
    return `Change text from "${this.oldText}" to "${this.newText}"`;
  }

  execute(): void {
    this.logoService.updateBrandText(this.newText);
  }

  undo(): void {
    this.logoService.updateBrandText(this.oldText);
  }
}

export class LogoColorChangeCommand implements UndoRedoCommand {
  constructor(
    private logoService: any,
    private colorType: 'primary' | 'secondary' | 'background',
    private newColor: string,
    private oldColor: string
  ) {}

  get description(): string {
    return `Change ${this.colorType} color from ${this.oldColor} to ${this.newColor}`;
  }

  execute(): void {
    this.logoService.updateColor(this.colorType, this.newColor);
  }

  undo(): void {
    this.logoService.updateColor(this.colorType, this.oldColor);
  }
}

export class LogoFontChangeCommand implements UndoRedoCommand {
  constructor(
    private logoService: any,
    private fontType: 'brand' | 'tagline',
    private newFontId: string,
    private oldFontId: string
  ) {}

  get description(): string {
    return `Change ${this.fontType} font from ${this.oldFontId} to ${this.newFontId}`;
  }

  execute(): void {
    this.logoService.updateFont(this.fontType, this.newFontId);
  }

  undo(): void {
    this.logoService.updateFont(this.fontType, this.oldFontId);
  }
}

export class LogoLayoutChangeCommand implements UndoRedoCommand {
  constructor(
    private logoService: any,
    private newLayout: string,
    private oldLayout: string
  ) {}

  get description(): string {
    return `Change layout from ${this.oldLayout} to ${this.newLayout}`;
  }

  execute(): void {
    this.logoService.updateLayout(this.newLayout);
  }

  undo(): void {
    this.logoService.updateLayout(this.oldLayout);
  }
} 