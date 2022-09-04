import type { Octokit } from '@octokit/rest';

import type { Setting } from '@/types/setting.type';

let octokit: Octokit | null;

export function setOctokit(instance: Octokit) {
  octokit = instance;
}

export function destroyOctokit() {
  octokit = null;
}

export function fetchAll() {
  if (!octokit) {
    return;
  }

  return octokit.rest.gists.list();
}

export interface OneGistParams {
  queryKey: string[];
}

export function fetchOne({ queryKey }: OneGistParams) {
  if (!octokit) {
    return;
  }

  const [, gist_id] = queryKey;

  return octokit.rest.gists.get({
    gist_id,
  });
}

interface GistPayload {
  gist_id?: string;
  public: boolean;
  description: string;
  fileName?: string;
  files: Record<
    string,
    {
      content: string;
    }
  >;
}

export interface GistCreation {
  gist: GistPayload;
  settings: Setting;
}

export function create({ gist, settings }: GistCreation) {
  if (!octokit) {
    return Promise.reject('None octokit found!');
  }

  return octokit.rest.gists.create({
    public: false,
    description: gist.description,
    files: {
      [`${gist.fileName}.json`]: {
        content: JSON.stringify(settings),
      },
    },
  });
}

export function updateGist(payload: any) {
  if (!octokit) {
    return;
  }

  return octokit.rest.gists.update(payload as any);
}
