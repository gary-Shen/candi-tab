import _ from 'lodash'

const isChrome = !!(chrome && chrome.storage)

export function get(key: string) {
  return new Promise((resolve, reject) => {
    try {
      if (isChrome) {
        chrome.storage.local.get((store) => {
          resolve(_.get(store, key))
        })
      }
      else {
        const result = localStorage.getItem(key)
        resolve(result ? JSON.parse(result) : result)
      }
    }
    catch (err) {
      reject(err)
    }
  })
}

export function set(key: string, payload: string | number | any) {
  return new Promise((resolve, reject) => {
    if (isChrome) {
      chrome.storage.local.set({ [key]: payload }, () => {
        resolve(true)
      })
    }
    else {
      try {
        localStorage.setItem(key, JSON.stringify(payload))
        resolve(true)
      }
      catch (err) {
        reject(err)
      }
    }
  })
}

/**
 * 订阅某个 key 的存储变更（跨标签页同步用），返回取消订阅函数。
 * 注意：chrome.storage.onChanged 在发起写入的页面里也会触发（回声），
 * 调用方需要自行做等值判断；localStorage 的 storage 事件只在其他标签页触发。
 */
export function subscribe(key: string, callback: (newValue: any) => void): () => void {
  if (isChrome) {
    const listener = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName === 'local' && key in changes) {
        callback(changes[key].newValue)
      }
    }
    chrome.storage.onChanged.addListener(listener)
    return () => chrome.storage.onChanged.removeListener(listener)
  }

  const listener = (e: StorageEvent) => {
    if (e.key !== key) {
      return
    }
    try {
      callback(e.newValue ? JSON.parse(e.newValue) : null)
    }
    catch (err) {
      console.warn('[storage] failed to parse external change', err)
    }
  }
  window.addEventListener('storage', listener)
  return () => window.removeEventListener('storage', listener)
}
