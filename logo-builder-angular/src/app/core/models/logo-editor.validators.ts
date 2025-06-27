import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { LOGO_EDITOR_CONSTANTS } from './logo-editor.constants';

export class LogoEditorValidators {
  static brandName(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value || value.trim().length === 0) {
      return { required: true };
    }
    
    if (value.length > LOGO_EDITOR_CONSTANTS.MAX_CHARACTERS) {
      return { maxLength: { 
        actualLength: value.length, 
        maxLength: LOGO_EDITOR_CONSTANTS.MAX_CHARACTERS 
      }};
    }
    
    return null;
  }

  static sloganText(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value && value.length > LOGO_EDITOR_CONSTANTS.MAX_CHARACTERS * 2) {
      return { maxLength: { 
        actualLength: value.length, 
        maxLength: LOGO_EDITOR_CONSTANTS.MAX_CHARACTERS * 2 
      }};
    }
    
    return null;
  }

  static fontSize(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    if (value < LOGO_EDITOR_CONSTANTS.MIN_FONT_SIZE) {
      return { min: { 
        actualValue: value, 
        minValue: LOGO_EDITOR_CONSTANTS.MIN_FONT_SIZE 
      }};
    }
    
    if (value > LOGO_EDITOR_CONSTANTS.MAX_FONT_SIZE) {
      return { max: { 
        actualValue: value, 
        maxValue: LOGO_EDITOR_CONSTANTS.MAX_FONT_SIZE 
      }};
    }
    
    return null;
  }

  static iconSize(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined) {
      return null;
    }
    
    if (value < LOGO_EDITOR_CONSTANTS.MIN_ICON_SIZE) {
      return { min: { 
        actualValue: value, 
        minValue: LOGO_EDITOR_CONSTANTS.MIN_ICON_SIZE 
      }};
    }
    
    if (value > LOGO_EDITOR_CONSTANTS.MAX_ICON_SIZE) {
      return { max: { 
        actualValue: value, 
        maxValue: LOGO_EDITOR_CONSTANTS.MAX_ICON_SIZE 
      }};
    }
    
    return null;
  }

  static hexColor(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    
    if (!hexPattern.test(value)) {
      return { invalidHexColor: true };
    }
    
    return null;
  }

  static fileType(allowedTypes: string[]): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      
      if (!file) {
        return null;
      }
      
      const fileType = file.type;
      const isValidType = allowedTypes.some(type => fileType.includes(type));
      
      if (!isValidType) {
        return { invalidFileType: { 
          actualType: fileType, 
          allowedTypes 
        }};
      }
      
      return null;
    };
  }

  static fileSize(maxSizeInMB: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const file = control.value as File;
      
      if (!file) {
        return null;
      }
      
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      if (file.size > maxSizeInBytes) {
        return { fileSizeExceeded: { 
          actualSize: file.size, 
          maxSize: maxSizeInBytes,
          maxSizeInMB 
        }};
      }
      
      return null;
    };
  }

  static range(min: number, max: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (value === null || value === undefined) {
        return null;
      }
      
      const numValue = Number(value);
      
      if (isNaN(numValue)) {
        return { invalidNumber: true };
      }
      
      if (numValue < min || numValue > max) {
        return { range: { 
          actualValue: numValue, 
          min, 
          max 
        }};
      }
      
      return null;
    };
  }

  static userInitials(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    if (value.length > 3) {
      return { maxLength: { 
        actualLength: value.length, 
        maxLength: 3 
      }};
    }
    
    const initialsPattern = /^[A-Za-z]+$/;
    
    if (!initialsPattern.test(value)) {
      return { invalidInitials: true };
    }
    
    return null;
  }
} 