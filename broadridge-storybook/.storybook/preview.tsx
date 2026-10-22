import type { Preview } from '@storybook/react-vite';
import '../src/tokens/generated/tokens.css';
import '../src/tokens/generated/typography.css';
import '../src/styles/base.css';
import { ComponentPage, wantsPageHeader } from '../src/foundations/kit/ComponentPage';

// Figma's Semantic collection defaults to Dark; Light is the alternate mode.
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: ['Introduction', 'Foundations', ['Colour', 'Palette', 'Typography', 'Spacing & Shape', 'Effects'], 'Components'],
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      test: 'todo',
    },
  },
  globalTypes: {
    theme: {
      description: 'Broadridge semantic mode',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: [
          { value: 'dark', icon: 'moon', title: 'Dark (default)' },
          { value: 'light', icon: 'sun', title: 'Light' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'dark',
  },
  decorators: [
    // Components stories get the same title block and padding as the Foundations pages.
    // Opt out with `parameters: { pageHeader: false }` (e.g. full-screen app shells).
    (Story, context) => (wantsPageHeader(context) ? <ComponentPage ctx={context}>{Story()}</ComponentPage> : Story()),
    (Story, context) => {
      const theme = context.globals.theme === 'light' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', theme);
      return Story();
    },
  ],
};

export default preview;
