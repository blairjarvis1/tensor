import { addons } from 'storybook/manager-api';
import { create } from 'storybook/theming';

// Sidebar brand: same mark as the shareable AI reference page (blue "BR" tile + "Broadridge DS").
addons.setConfig({
  theme: create({
    base: 'light',
    brandTitle: 'Broadridge DS v1.0',
    brandImage: './broadridge-ds-logo.svg',
    brandUrl: './',
    brandTarget: '_self',
    // Sidebar (appBg) matches the white top bar (barBg) instead of Storybook's default #F6F9FC.
    appBg: '#FFFFFF',
    barBg: '#FFFFFF',
    colorPrimary: '#2662FC',
    colorSecondary: '#2662FC',
    fontBase: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  }),
});
