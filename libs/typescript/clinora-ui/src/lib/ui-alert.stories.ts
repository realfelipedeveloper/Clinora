import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { UiAlert } from './ui-alert';

const meta: Meta<UiAlert> = {
  title: 'Design System/Aviso',
  component: UiAlert,
  decorators: [moduleMetadata({ imports: [UiAlert] })],
  render: (args) => ({
    props: args,
    template: '<clinora-alert [tone]="tone">Mensagem importante para o usuário.</clinora-alert>',
  }),
};

export default meta;
type Story = StoryObj<UiAlert>;

export const Informativo: Story = { args: { tone: 'info' } };
export const Sucesso: Story = { args: { tone: 'success' } };
export const Erro: Story = { args: { tone: 'danger' } };
