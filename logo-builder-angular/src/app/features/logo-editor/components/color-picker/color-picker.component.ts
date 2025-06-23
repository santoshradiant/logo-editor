import { Component, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter, Input } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-color-picker',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss'
})
export class ColorPickerComponent implements AfterViewInit {
  @ViewChild('saturationCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>
  @ViewChild('pickerCircle', { static: true }) circleRef!: ElementRef<HTMLDivElement>

  hexValue = '#FDD20A'
  hue = 50
  selectedColor: string | null = null
  actionsEnabled = false
  initialHexValue = this.hexValue;
  initialHue = this.hue;

  presetColors: string[] = [
    '#000000',
    '#FFFFFF',
    '#D94F2A',
    '#D9A23F',
    '#F0C43F',
    '#6DC16D',
    '#5CAEFF',
    '#397ED9',
    '#A070F0',
    '#FDD20A'
  ]

  ngAfterViewInit(): void {
    this.drawSaturationCanvas(this.hue)

    const canvas = this.canvasRef.nativeElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.addEventListener('click', (e) => {
      if (!this.actionsEnabled) {
     this.initialHexValue = this.hexValue;
    this.initialHue = this.hue;
  }
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const pixel = ctx.getImageData(x, y, 1, 1).data
      this.hexValue = this.rgbToHex(pixel[0], pixel[1], pixel[2])
      this.selectedColor = null
      this.enableActions()
      this.circleRef.nativeElement.style.left = `${x - 7}px`
      this.circleRef.nativeElement.style.top = `${y - 7}px`
    })

    setTimeout(() => this.drawSaturationCanvas(this.hue), 0) // canvas sizing
  }

  selectPresetColor(color: string) {
  if (!this.actionsEnabled) {
    this.initialHexValue = this.hexValue;
    this.initialHue = this.hue;
  }

  this.selectedColor = color;
  this.hexValue = color;
  const hsl = this.hexToHSL(color);
  this.hue = hsl.h;
  this.drawSaturationCanvas(this.hue);
  this.enableActions();
}

  onHueChange() {
    this.drawSaturationCanvas(this.hue)
    this.enableActions()
  }

  enableActions() {
    this.actionsEnabled = true
  }

  drawSaturationCanvas(hue: number) {
    const canvas = this.canvasRef.nativeElement
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const whiteGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    whiteGrad.addColorStop(0, '#fff')
    whiteGrad.addColorStop(1, 'transparent')
    ctx.fillStyle = whiteGrad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    const blackGrad = ctx.createLinearGradient(0, 0, 0, canvas.height)
    blackGrad.addColorStop(0, 'transparent')
    blackGrad.addColorStop(1, '#000')
    ctx.fillStyle = blackGrad
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  rgbToHex(r: number, g: number, b: number): string {
    return (
      '#' +
      [r, g, b]
        .map((x) => x.toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase()
    )
  }

  hexToHSL(hex: string): { h: number; s: number; l: number } {
    let r = parseInt(hex.slice(1, 3), 16) / 255
    let g = parseInt(hex.slice(3, 5), 16) / 255
    let b = parseInt(hex.slice(5, 7), 16) / 255

    const max = Math.max(r, g, b),
      min = Math.min(r, g, b)
    let h = 0,
      s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h *= 60
    }

    return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  onInputChange(event: Event): void {
    this.hue = +(event.target as HTMLInputElement).value
    this.onHueChange()
  }

  onHexInputChange(event: Event): void {
    this.hexValue = (event.target as HTMLInputElement).value
    // Optional: Add validation for hex color format
    // const hexRegex = /^#[0-9A-F]{6}$/i;
    // if (hexRegex.test(this.hexValue)) {
    //   // Valid hex color
    // }
    this.enableActions()
  }
  
  @Output() closed = new EventEmitter<void>();
  @Output() colorSelected = new EventEmitter<string>();

closePicker() {
  this.closed.emit();
}

  onCancel() {
  this.hexValue = this.initialHexValue;
  this.hue = this.initialHue;
  this.selectedColor = this.initialHexValue;
  this.drawSaturationCanvas(this.hue);
  this.actionsEnabled = false;
  this.closePicker(); // Optional: logic to close the picker
}

  onApply() {
    this.colorSelected.emit(this.hexValue);
    this.closePicker();
  }
}
