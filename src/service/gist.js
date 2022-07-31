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

export function create({ gist, settings }) {
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

export function updateGist(payload) {
  if (!octokit) {
    return;
  }

  return octokit.rest.gists.update(payload);
}
