import type { StorybookConfig } from '@storybook/angular';

const config: StorybookConfig = {
  framework: '@storybook/angular',
  stories: ['../src/lib/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  core: { disableTelemetry: true },
};

export default config;
