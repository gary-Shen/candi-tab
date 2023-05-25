import type { Layout } from 'react-grid-layout';

import type { Theme } from './theme.type';

export interface MenuLink {
  id: string;
  title: string;
  url: string;
}

export interface Link {
  id: string;
  style: 'danger' | 'primary' | 'secondary' | 'dark' | 'warning' | 'success' | 'info';
  menu?: MenuLink[];
  description?: string;
  url?: string;
  title: string;
}

export type Links = Link[];

export interface Block {
  id: string;
  title: string;
  layout: Layout;
  buttons?: Links;
}

export interface Setting {
  links: Block[];
  createdAt: number;
  theme: Theme;
  // 可能导出gistId
  gistId?: string;
  fileName?: string;
  clipboard: string;
  gist?: {
    id: string;
    fileName: string;
    description: string;
  };
}
