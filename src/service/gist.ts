import type { Octokit } from '@octokit/rest'

import type { Setting } from '@/types/setting.type'

let octokit: Octokit | null

export function setOctokit(instance: Octokit) {
  if (octokit) {
    octokit = null
  }

  octokit = instance
}

export function destroyOctokit() {
  octokit = null
}

export function fetchAll() {
  if (!octokit) {
    return Promise.reject(new Error('None octokit found!'))
  }

  return octokit.rest.gists.list()
}

export interface GistsGetParams {
  gist_id: string
}

export function fetchOne({ gist_id }: GistsGetParams) {
  if (!gist_id) {
    return Promise.reject(new Error('None gist_id found!'))
  }

  if (!octokit) {
    return Promise.reject(new Error('None octokit found!'))
  }

  return octokit.rest.gists.get({
    gist_id,
  })
}

export interface GistPayload {
  gist_id?: string
  public: boolean
  description: string
  fileName?: string
  files: Record<
    string,
    {
      content: string
    }
  >
}

export interface GistCreation {
  gist: GistPayload
  settings: Setting
}

export function create({ gist, settings }: GistCreation) {
  if (!octokit) {
    return Promise.reject(new Error('None octokit found!'))
  }

  return octokit.rest.gists.create({
    public: false,
    description: gist.description,
    files: {
      [`${gist.fileName}`]: {
        content: JSON.stringify(settings),
      },
    },
  })
}

export function removeToken() {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.remove('token', () => {
      resolve(null)

      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      }
    })
  })
}

export interface GistUpdateParams {
  gist_id: string
  description?: string
  files: Record<string, { content: string }>
  [key: string]: any
}

export function updateGist(payload: GistUpdateParams) {
  if (!octokit) {
    return Promise.reject(new Error('None octokit found!'))
  }

  return octokit.rest.gists.update(payload)
}
