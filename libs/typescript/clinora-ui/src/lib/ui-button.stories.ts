import type { Meta, StoryObj } from '@storybook/angular';
import { UiButton } from './ui-button';

const meta: Meta<UiButton> = {
  title: 'Design System/Botão',
  component: UiButton,
  render: (args) => ({
    props: args,
    template: '<clinora-button [variant]="variant" [disabled]="disabled">Salvar</clinora-button>',
  }),
};

export default meta;
type Story = StoryObj<UiButton>;

export const Primario: Story = { name: 'Primário', args: { variant: 'primary', disabled: false } };
export const Secundario: Story = {
  name: 'Secundário',
  args: { variant: 'secondary', disabled: false },
};
export const Desabilitado: Story = {
  name: 'Desabilitado',
  args: { variant: 'primary', disabled: true },
};
