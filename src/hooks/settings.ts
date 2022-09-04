import type { Setting } from '@/types/setting.type';

import { get, set } from './storage';

export function save(settings: Setting) {
  return set('settings', settings);
}

export function load(): Promise<Setting> {
  return get('settings') as Promise<Setting>;
}
