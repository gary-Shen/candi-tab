import _ from 'lodash';

const isChrome = !!(chrome && chrome.storage);

export function get(key) {
  return new Promise((resolve, reject) => {
    try {
      if (isChrome) {
        chrome.storage.local.get((store) => {
          resolve(_.get(store, key));
        });
      } else {
        resolve(JSON.parse(localStorage.getItem(key)));
      }
    } catch (err) {
      reject(err);
    }
  });
}

export function set(key, payload) {
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
