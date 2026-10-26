import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'clinora-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<section><ng-content /></section>`,
  styles: `
    section {
      padding: 20px;
      border: 1px solid var(--color-line, #d9e4e1);
      border-radius: 6px;
      background: var(--color-paper, white);
      color: var(--color-ink, #163c3e);
    }
  `,
})
export class UiCard {}
