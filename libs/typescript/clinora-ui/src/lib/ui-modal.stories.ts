import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { UiModal } from './ui-modal';

const meta: Meta<UiModal> = {
  title: 'Design System/Janela modal',
  component: UiModal,
  decorators: [moduleMetadata({ imports: [UiModal] })],
  render: (args) => ({
    props: args,
    template: `
      <button type="button" (click)="open = true">Abrir</button>
      <clinora-modal [title]="title" [open]="open" (closed)="open = false">
        <p>Conteúdo da janela modal.</p>
      </clinora-modal>
    `,
  }),
};

export default meta;
type Story = StoryObj<UiModal>;

export const Padrao: Story = { name: 'Padrão', args: { title: 'Detalhes', open: false } };
