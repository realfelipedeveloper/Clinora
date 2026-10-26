import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextInputId = 0;

@Component({
  selector: 'clinora-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiInput), multi: true }],
  template: `
    <label>
      <span>{{ label }}</span>
      <input
        [id]="id"
        [type]="type"
        [value]="value"
        [placeholder]="placeholder"
        [required]="required"
        [disabled]="disabled"
        [attr.autocomplete]="autocomplete"
        [attr.aria-invalid]="error ? 'true' : null"
        [attr.aria-describedby]="error ? id + '-error' : null"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </label>
    @if (error) {
      <p class="error" [id]="id + '-error'">{{ error }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
    }
    label {
      display: grid;
      gap: 6px;
      color: var(--color-ink, #163c3e);
      font: inherit;
      font-weight: 600;
    }
    input {
      width: 100%;
      min-height: 40px;
      padding: 8px 12px;
      border: 1px solid var(--color-line, #d9e4e1);
      border-radius: var(--radius-control, 4px);
      background: var(--color-paper, white);
      color: var(--color-ink, #163c3e);
      font: inherit;
    }
    input:focus-visible {
      outline: 2px solid var(--color-brand, #367f79);
      outline-offset: 1px;
    }
    input[aria-invalid='true'] {
      border-color: var(--color-danger, #b34141);
    }
    .error {
      margin: 4px 0 0;
      color: var(--color-danger, #b34141);
      font-size: 0.875rem;
    }
  `,
})
export class UiInput implements ControlValueAccessor {
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Input({ required: true }) label = '';
  @Input() id = `clinora-input-${++nextInputId}`;
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'tel' | 'password' | 'search' = 'text';
  @Input() autocomplete?: string;
  @Input() required = false;
  @Input() error = '';
  disabled = false;
  value = '';
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string | null): void {
    this.value = value ?? '';
    this.changeDetector.markForCheck();
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    this.changeDetector.markForCheck();
  }
  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }
}
