import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  inject,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface UiSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

let nextSelectId = 0;

@Component({
  selector: 'clinora-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => UiSelect), multi: true }],
  template: `
    <label>
      <span>{{ label }}</span>
      <select
        [id]="id"
        [value]="value"
        [required]="required"
        [disabled]="disabled"
        [attr.aria-invalid]="error ? 'true' : null"
        [attr.aria-describedby]="error ? id + '-error' : null"
        (change)="onSelect($event)"
        (blur)="onTouched()"
      >
        <option value="" disabled [selected]="!value">{{ placeholder }}</option>
        @for (option of options; track option.value) {
          <option
            [value]="option.value"
            [disabled]="option.disabled"
            [selected]="option.value === value"
          >
            {{ option.label }}
          </option>
        }
      </select>
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
    select {
      width: 100%;
      min-height: 40px;
      padding: 8px 12px;
      border: 1px solid var(--color-line, #d9e4e1);
      border-radius: var(--radius-control, 4px);
      background: var(--color-paper, white);
      color: var(--color-ink, #163c3e);
      font: inherit;
    }
    select:focus-visible {
      outline: 2px solid var(--color-brand, #367f79);
      outline-offset: 1px;
    }
    select[aria-invalid='true'] {
      border-color: var(--color-danger, #b34141);
    }
    .error {
      margin: 4px 0 0;
      color: var(--color-danger, #b34141);
      font-size: 0.875rem;
    }
  `,
})
export class UiSelect implements ControlValueAccessor {
  private readonly changeDetector = inject(ChangeDetectorRef);
  @Input({ required: true }) label = '';
  @Input() id = `clinora-select-${++nextSelectId}`;
  @Input() placeholder = 'Selecione';
  @Input() options: UiSelectOption[] = [];
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
  onSelect(event: Event): void {
    this.value = (event.target as HTMLSelectElement).value;
    this.onChange(this.value);
  }
}
