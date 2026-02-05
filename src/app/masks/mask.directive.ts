import { Directive, ElementRef, forwardRef, HostListener, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { applyMask, caretPositionForDigitIndex, onlyDigits, type MaskType } from './mask.utils';

@Directive({
  selector: '[appMask]',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MaskDirective),
      multi: true
    }
  ]
})
export class MaskDirective implements ControlValueAccessor {
  @Input('appMask') maskType: MaskType = 'cpf';

  private onChange: (value: string) => void = () => {};
  private onTouched: () => void = () => {};

  constructor(private readonly elementRef: ElementRef<HTMLInputElement>) {}

  writeValue(value: unknown): void {
    const input = this.elementRef.nativeElement;
    const masked = applyMask(String(value ?? ''), this.maskType);
    input.value = masked;
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.elementRef.nativeElement.disabled = isDisabled;
  }

  @HostListener('input')
  onInput(): void {
    const input = this.elementRef.nativeElement;
    const rawValue = input.value ?? '';

    const selectionStart = input.selectionStart ?? rawValue.length;
    const digitIndex = onlyDigits(rawValue.slice(0, selectionStart)).length;

    const masked = applyMask(rawValue, this.maskType);
    if (masked !== rawValue) input.value = masked;

    const nextPos = caretPositionForDigitIndex(masked, digitIndex);
    try {
      input.setSelectionRange(nextPos, nextPos);
    } catch {
    }

    this.onChange(masked);
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched();
  }
}
