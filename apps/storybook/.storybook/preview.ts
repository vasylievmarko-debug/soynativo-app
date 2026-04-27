import type { Preview } from '@storybook/react';
import { withThemeProvider } from './decorators/theme-provider';

// Viewport presets для мобильных размеров
const customViewports = {
  mobile: {
    name: 'Mobile (375px)',
    styles: {
      width: '375px',
      height: '812px',
    },
    type: 'mobile',
  },
  tablet: {
    name: 'Tablet (768px)',
    styles: {
      width: '768px',
      height: '1024px',
    },
    type: 'tablet',
  },
  desktop: {
    name: 'Desktop (1440px)',
    styles: {
      width: '1440px',
      height: '900px',
    },
    type: 'desktop',
  },
};

const preview: Preview = {
  parameters: {
    viewport: {
      viewports: customViewports,
      defaultViewport: 'mobile',
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    themes: {
      default: 'light',
      list: [
        { name: 'Light', value: 'light' },
        { name: 'Dark', value: 'dark' },
      ],
    },
  },
  decorators: [withThemeProvider],
};

export default preview;

