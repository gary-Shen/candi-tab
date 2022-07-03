let octokit;

export function setOctokit(instance) {
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

export function fetchOne({ queryKey }) {
  if (!octokit) {
    return;
  }

  const [, gist_id] = queryKey;

  return octokit.rest.gists.get({
    gist_id,
  });
}

export function create(payload) {
  octokit.rest.gists.create({
    public: false,
    description: 'A gist for settings syncing of candi-tab chrome extension',
    files: {
      'candi_tab_settings.json': {
        content: JSON.stringify(payload),
      },
    },
  });
}

export function updateGist(payload) {
  if (!octokit) {
    return;
  }

  return octokit.rest.gists.update(payload);
}
