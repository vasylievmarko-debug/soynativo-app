// Top-level UI barrel — pull from `@shared/ui` to avoid coupling to layout.
export * from './atoms';
export * from './molecules';
export * from './organisms';
export { useTheme } from './theme/ThemeProvider';
export { ThemeProvider } from './theme/ThemeProvider';
export type { Theme } from './theme/theme';
