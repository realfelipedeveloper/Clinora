import type { Meta, StoryObj } from '@storybook/angular';
import { UiSelect } from './ui-select';

const meta: Meta<UiSelect> = {
  title: 'Design System/Seleção',
  component: UiSelect,
};

export default meta;
type Story = StoryObj<UiSelect>;

const options = [
  { value: 'a', label: 'Primeira opção' },
  { value: 'b', label: 'Segunda opção' },
];

export const Padrao: Story = { name: 'Padrão', args: { label: 'Opção', options } };
export const ComErro: Story = {
  name: 'Com erro',
  args: { label: 'Opção', options, error: 'Selecione uma opção' },
};
