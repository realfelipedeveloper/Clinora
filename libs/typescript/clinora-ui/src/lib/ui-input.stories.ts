import type { Meta, StoryObj } from '@storybook/angular';
import { UiInput } from './ui-input';

const meta: Meta<UiInput> = {
  title: 'Design System/Campo de texto',
  component: UiInput,
};

export default meta;
type Story = StoryObj<UiInput>;

export const Padrao: Story = {
  name: 'Padrão',
  args: { label: 'Nome', placeholder: 'Nome completo' },
};
export const ComErro: Story = {
  name: 'Com erro',
  args: { label: 'E-mail', type: 'email', error: 'Informe um e-mail válido' },
};
