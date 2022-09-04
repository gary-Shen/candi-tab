import _ from 'lodash';

const isChrome = !!(chrome && chrome.storage);

export function get(key: string) {
  return new Promise((resolve, reject) => {
    try {
      if (isChrome) {
        chrome.storage.local.get((store) => {
          resolve(_.get(store, key));
        });
      } else {
        const result = localStorage.getItem(key);
        resolve(result ? JSON.parse(result) : result);
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function set(key: string, payload: string | number | any) {
  return new Promise((resolve, reject) => {
    if (isChrome) {
      chrome.storage.local.set({ [key]: payload }, () => {
        resolve(true);
      });
    } else {
      try {
        localStorage.setItem(key, JSON.stringify(payload));
        resolve(true);
      } catch (err) {
        reject(err);
      }
    }
  });
}
