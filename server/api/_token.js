const mapping = new Map();

function setToken(uuid, token) {
  mapping.set(uuid, token);

  setTimeout(() => {
    removeToken(uuid);
  }, 60000);
}

function getToken(uuid) {
  return mapping.get(uuid);
}

function removeToken(uuid) {
  mapping.delete(uuid);
}

function clear() {
  mapping.clear();
}

module.exports = {
  setToken,
  getToken,
  removeToken,
  clear,
};
