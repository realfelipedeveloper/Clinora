import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { fireEvent, render, screen } from '@testing-library/angular';
import { UiAlert } from './ui-alert';
import { UiButton } from './ui-button';
import { UiCard } from './ui-card';
import { UiInput } from './ui-input';
import { UiModal } from './ui-modal';
import { UiSelect } from './ui-select';
import { UiStatusBadge } from './ui-status-badge';

@Component({
  imports: [ReactiveFormsModule, UiInput, UiSelect],
  template: `
    <clinora-input label="Nome" [formControl]="name" />
    <clinora-select label="Opção" [options]="options" [formControl]="choice" />
  `,
})
class FormHost {
  name = new FormControl('Ana', { nonNullable: true });
  choice = new FormControl('b', { nonNullable: true });
  options = [
    { value: 'a', label: 'A' },
    { value: 'b', label: 'B' },
  ];
}

describe('Clinora UI', () => {
  it('updates the form through accessible controls', async () => {
    const view = await render(FormHost);
    const name = screen.getByRole('textbox', { name: 'Nome' });
    const choice = screen.getByRole('combobox', { name: 'Opção' });

    fireEvent.input(name, { target: { value: 'Bia' } });
    fireEvent.change(choice, { target: { value: 'a' } });

    expect(view.fixture.componentInstance.name.value).toBe('Bia');
    expect(view.fixture.componentInstance.choice.value).toBe('a');
  });

  it('works through Angular reactive forms', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(input.value).toBe('Ana');
    expect(select.value).toBe('b');
    input.value = 'Bia';
    input.dispatchEvent(new Event('input'));
    select.value = 'a';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.name.value).toBe('Bia');
    expect(fixture.componentInstance.choice.value).toBe('a');
  });

  it('disables the native button', () => {
    const fixture = TestBed.createComponent(UiButton);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('connects input value changes to Angular forms', () => {
    const fixture = TestBed.createComponent(UiInput);
    fixture.componentRef.setInput('label', 'Nome');
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const changed = vi.fn();
    component.registerOnChange(changed);
    component.writeValue('Ana');
    fixture.detectChanges();
    expect(input.value).toBe('Ana');
    expect(input.labels?.[0]?.textContent).toContain('Nome');
    input.value = 'Bia';
    input.dispatchEvent(new Event('input'));
    expect(changed).toHaveBeenCalledWith('Bia');
  });

  it('links input errors and propagates disabled state', () => {
    const fixture = TestBed.createComponent(UiInput);
    fixture.componentRef.setInput('label', 'E-mail');
    fixture.componentRef.setInput('error', 'Informe um e-mail válido');
    fixture.componentInstance.setDisabledState(true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(
      fixture.nativeElement.querySelector(`#${input.getAttribute('aria-describedby')}`)
        ?.textContent,
    ).toContain('Informe um e-mail válido');
  });

  it('connects select value changes to Angular forms', () => {
    const fixture = TestBed.createComponent(UiSelect);
    fixture.componentRef.setInput('label', 'Opção');
    fixture.componentRef.setInput('options', [
      { value: 'a', label: 'A' },
      { value: 'b', label: 'B' },
    ]);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    const changed = vi.fn();
    fixture.componentInstance.registerOnChange(changed);
    fixture.componentInstance.writeValue('b');
    fixture.detectChanges();
    expect(select.value).toBe('b');
    select.value = 'a';
    select.dispatchEvent(new Event('change'));
    expect(changed).toHaveBeenCalledWith('a');
  });

  it('shows an empty selection until the user chooses an option', () => {
    const fixture = TestBed.createComponent(UiSelect);
    fixture.componentRef.setInput('label', 'Serviço');
    fixture.componentRef.setInput('options', [{ value: 'a', label: 'A' }]);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('');
    expect(select.selectedOptions[0].textContent).toContain('Selecione');
  });

  it('renders semantic card and alert surfaces', () => {
    const card = TestBed.createComponent(UiCard);
    const alert = TestBed.createComponent(UiAlert);
    alert.componentRef.setInput('tone', 'danger');
    card.detectChanges();
    alert.detectChanges();
    expect(card.nativeElement.querySelector('section')).toBeTruthy();
    expect(alert.nativeElement.querySelector('[role="alert"]')).toBeTruthy();
  });

  it('renders a labelled modal and closes on Escape', () => {
    const fixture = TestBed.createComponent(UiModal);
    fixture.componentRef.setInput('title', 'Detalhes');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.textContent).toContain('Detalhes');
    const closed = vi.fn();
    fixture.componentInstance.closed.subscribe(closed);
    dialog.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(closed).toHaveBeenCalled();
  });

  it('restores focus after the modal closes', () => {
    const opener = document.createElement('button');
    document.body.append(opener);
    opener.focus();
    const fixture = TestBed.createComponent(UiModal);
    fixture.componentRef.setInput('title', 'Detalhes');
    fixture.componentRef.setInput('open', true);
    fixture.detectChanges();
    expect(document.activeElement?.getAttribute('role')).toBe('dialog');
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]') as HTMLElement;
    dialog.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true }),
    );
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Fechar');
    fixture.componentRef.setInput('open', false);
    fixture.detectChanges();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('renders status with accessible text', () => {
    const fixture = TestBed.createComponent(UiStatusBadge);
    fixture.componentRef.setInput('label', 'Ativo');
    fixture.componentRef.setInput('tone', 'success');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Ativo');
  });
});
