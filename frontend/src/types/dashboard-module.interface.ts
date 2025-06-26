import { ReactNode } from 'react';

export interface DashboardModule {
  /** Unique route path for the module (e.g. "/jobs") */
  route: string;
  /** Display name for navigation/header */
  label: string;
  /** Optional icon for header/nav */
  icon: React.ReactElement;
  /** The main component to render for this module */
  Component: React.ComponentType<any>;
  /** Optional: header actions (e.g. buttons) */
  headerActions?: ReactNode;
}
