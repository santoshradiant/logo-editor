import { 
  Component, 
  Input, 
  Output, 
  EventEmitter, 
  ChangeDetectionStrategy, 
  OnChanges, 
  SimpleChanges 
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { 
  BrandConfiguration, 
  FontRecommendation,
  UploadedFont 
} from '../../../../../core/models/logo-editor.interface';
import { 
  LOGO_EDITOR_CONSTANTS, 
  RECOMMENDED_FONTS 
} from '../../../../../core/models/logo-editor.constants';
import { LogoEditorValidators } from '../../../../../core/models/logo-editor.validators';
import { LogoEditorHelper } from '../../../../../core/models/logo-editor.helper';

@Component({
  selector: 'lz-logo-editor-brand-presentation',
  templateUrl: './logo-editor-brand-presentation.component.html',
  styleUrls: ['./logo-editor-brand-presentation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoEditorBrandPresentationComponent implements OnChanges {
  @Input() brandConfig!: BrandConfiguration;
  @Input() isLoading: boolean = false;

  @Output() brandConfigChange = new EventEmitter<Partial<BrandConfiguration>>();
  @Output() brandNameChange = new EventEmitter<string>();
  @Output() fontChange = new EventEmitter<string>();

  // Form management
  brandForm!: FormGroup;
  
  // Constants exposed to template
  readonly maxCharacters = LOGO_EDITOR_CONSTANTS.MAX_CHARACTERS;
  readonly characterCountThreshold = LOGO_EDITOR_CONSTANTS.CHARACTER_COUNT_THRESHOLD;
  readonly minFontSize = LOGO_EDITOR_CONSTANTS.MIN_FONT_SIZE;
  readonly maxFontSize = LOGO_EDITOR_CONSTANTS.MAX_FONT_SIZE;
  readonly recommendedFonts = RECOMMENDED_FONTS;

  // Component state
  isShowingCharacterCounter = false;
  isCharacterLimitExceeded = false;
  showCustomFontDropdown = false;
  uploadedFonts: UploadedFont[] = [];
  selectedFontIndex = 0;

  // Debounced functions
  private debouncedBrandNameChange = LogoEditorHelper.debounce(
    (name: string) => this.brandNameChange.emit(name)
  );

  constructor(private readonly fb: FormBuilder) {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['brandConfig'] && this.brandConfig) {
      this.updateFormFromConfig();
      this.updateComponentState();
    }
  }

  // Public methods for template
  onBrandNameInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    const value = target.value;
    
    this.updateCharacterCountState(value);
    this.debouncedBrandNameChange(value);
  }

  onFontSelect(font: FontRecommendation, index: number): void {
    this.selectedFontIndex = index;
    this.fontChange.emit(font.family);
    this.emitConfigChange({ selectedFont: font.family });
  }

  onFontSizeChange(size: number): void {
    const clampedSize = LogoEditorHelper.clamp(
      size, 
      this.minFontSize, 
      this.maxFontSize
    );
    this.emitConfigChange({ fontSize: clampedSize });
  }

  onLetterSpacingChange(spacing: number): void {
    this.emitConfigChange({ letterSpacing: spacing });
  }

  onLineHeightChange(height: number): void {
    this.emitConfigChange({ lineHeight: height });
  }

  onBoldToggle(): void {
    this.emitConfigChange({ isBold: !this.brandConfig.isBold });
  }

  onItalicToggle(): void {
    this.emitConfigChange({ isItalic: !this.brandConfig.isItalic });
  }

  onMultilineToggle(): void {
    this.emitConfigChange({ isMultiline: !this.brandConfig.isMultiline });
  }

  onCustomFontToggle(): void {
    this.showCustomFontDropdown = !this.showCustomFontDropdown;
  }

  onFontUpload(event: Event): void {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    
    if (files && files.length > 0) {
      const file = files[0];
      
      if (LogoEditorHelper.isValidFontFile(file)) {
        this.processFontUpload(file);
      } else {
        // Emit error event or show error message
        console.error('Invalid font file type');
      }
    }
  }

  onUploadedFontSelect(font: UploadedFont): void {
    this.fontChange.emit(font.family);
    this.emitConfigChange({ selectedFont: font.family });
    this.showCustomFontDropdown = false;
  }

  // Getters for template
  get characterCountText(): string {
    return LogoEditorHelper.generateCharacterCountText(this.brandConfig.name);
  }

  get displayFonts(): FontRecommendation[] {
    return this.recommendedFonts;
  }

  get hasUploadedFonts(): boolean {
    return this.uploadedFonts.length > 0;
  }

  get formValid(): boolean {
    return this.brandForm.valid;
  }

  get fontSizeWithinRange(): boolean {
    const size = this.brandConfig.fontSize;
    return size >= this.minFontSize && size <= this.maxFontSize;
  }

  // Private methods
  private initializeForm(): void {
    this.brandForm = this.fb.group({
      name: ['', [LogoEditorValidators.brandName]],
      fontSize: [
        LOGO_EDITOR_CONSTANTS.DEFAULT_FONT_SIZE, 
        [LogoEditorValidators.fontSize]
      ],
      letterSpacing: [LOGO_EDITOR_CONSTANTS.DEFAULT_LETTER_SPACING],
      lineHeight: [LOGO_EDITOR_CONSTANTS.DEFAULT_LINE_HEIGHT]
    });
  }

  private updateFormFromConfig(): void {
    if (!this.brandConfig) return;

    this.brandForm.patchValue({
      name: this.brandConfig.name,
      fontSize: this.brandConfig.fontSize,
      letterSpacing: this.brandConfig.letterSpacing,
      lineHeight: this.brandConfig.lineHeight
    }, { emitEvent: false });

    // Update selected font index
    this.selectedFontIndex = this.recommendedFonts.findIndex(
      font => font.family === this.brandConfig.selectedFont
    );
    if (this.selectedFontIndex === -1) {
      this.selectedFontIndex = 0;
    }
  }

  private updateComponentState(): void {
    this.updateCharacterCountState(this.brandConfig.name);
  }

  private updateCharacterCountState(text: string): void {
    this.isShowingCharacterCounter = LogoEditorHelper.shouldShowCharacterCounter(text);
    this.isCharacterLimitExceeded = LogoEditorHelper.isCharacterLimitExceeded(text);
  }

  private emitConfigChange(changes: Partial<BrandConfiguration>): void {
    this.brandConfigChange.emit(changes);
  }

  private processFontUpload(file: File): void {
    const fontName = LogoEditorHelper.extractFontNameFromFile(file.name);
    const fontFamily = fontName.replace(/\s+/g, '-').toLowerCase();

    const uploadedFont: UploadedFont = {
      name: fontName,
      family: fontFamily,
      file: file
    };

    // Load font for use
    this.loadFontFile(file, fontFamily)
      .then(() => {
        this.uploadedFonts.push(uploadedFont);
        this.onUploadedFontSelect(uploadedFont);
      })
      .catch(error => {
        console.error('Failed to load font:', error);
      });
  }

  private loadFontFile(file: File, fontFamily: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (event) => {
        try {
          const fontData = event.target?.result as ArrayBuffer;
          const font = new FontFace(fontFamily, fontData);
          
          font.load().then(() => {
            (document.fonts as any).add(font);
            resolve();
          }).catch(reject);
          
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read font file'));
      reader.readAsArrayBuffer(file);
    });
  }
} 