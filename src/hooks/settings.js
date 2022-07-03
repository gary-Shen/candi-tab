import { set, get } from './storage';

export function save(settings) {
  return set('settings', settings);
}

export function load() {
  return get('settings');
}