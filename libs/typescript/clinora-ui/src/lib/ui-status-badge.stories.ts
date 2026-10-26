import type { Meta, StoryObj } from '@storybook/angular';
import { UiStatusBadge } from './ui-status-badge';

const meta: Meta<UiStatusBadge> = {
  title: 'Design System/Indicador de status',
  component: UiStatusBadge,
};

export default meta;
type Story = StoryObj<UiStatusBadge>;

export const Neutro: Story = { args: { label: 'Pendente', tone: 'neutral' } };
export const Sucesso: Story = { args: { label: 'Ativo', tone: 'success' } };
export const Atencao: Story = { name: 'Atenção', args: { label: 'Atenção', tone: 'warning' } };
