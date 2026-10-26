import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { UiCard } from './ui-card';

const meta: Meta<UiCard> = {
  title: 'Design System/Cartão',
  component: UiCard,
  decorators: [moduleMetadata({ imports: [UiCard] })],
  render: () => ({
    template: '<clinora-card><h3>Item individual</h3><p>Conteúdo do cartão.</p></clinora-card>',
  }),
};

export default meta;
type Story = StoryObj<UiCard>;

export const Padrao: Story = { name: 'Padrão' };
