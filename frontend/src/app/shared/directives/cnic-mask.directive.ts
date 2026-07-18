import { Directive, ElementRef, HostListener, Optional, Self } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appCnicMask]',
  standalone: true,
})
export class CnicMaskDirective {
  constructor(
    private el: ElementRef<HTMLInputElement>,
    @Self() @Optional() private ngControl: NgControl,
  ) {}

  private format(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    const input = this.el.nativeElement;
    const cursor = input.selectionStart ?? 0;
    const selectionLen = (input.selectionEnd ?? 0) - cursor;

    // Backspace on a dash: remove the dash + the digit before it
    if (event.key === 'Backspace' && cursor > 0 && input.value[cursor - 1] === '-') {
      event.preventDefault();
      const newRaw = input.value.slice(0, cursor - 2) + input.value.slice(cursor);
      this.apply(this.format(newRaw), cursor - 2);
      return;
    }

    // Block additional digits once 13 are present (allow if text is selected — it's a replacement)
    const isDigit = /^\d$/.test(event.key);
    const isModified = event.ctrlKey || event.metaKey || event.altKey;
    const digitCount = input.value.replace(/\D/g, '').length;
    if (isDigit && !isModified && digitCount >= 13 && selectionLen === 0) {
      event.preventDefault();
    }
  }

  @HostListener('input')
  onInput(): void {
    const input = this.el.nativeElement;
    const cursor = input.selectionStart ?? 0;
    const raw = input.value;

    // Count digits before cursor so we can restore position after formatting
    const digitsBeforeCursor = raw.slice(0, cursor).replace(/\D/g, '').length;
    const formatted = this.format(raw);

    // Map digit count back to position in the formatted string
    let newCursor = 0;
    if (digitsBeforeCursor > 0) {
      let count = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== '-') count++;
        if (count === digitsBeforeCursor) { newCursor = i + 1; break; }
      }
    }

    this.apply(formatted, newCursor);
  }

  private apply(formatted: string, cursor: number): void {
    const input = this.el.nativeElement;
    input.value = formatted;
    this.ngControl?.control?.setValue(formatted, { emitEvent: true });
    // Restore cursor after Angular's writeValue cycle
    Promise.resolve().then(() => input.setSelectionRange(cursor, cursor));
  }
}
