const fabric = require('@umijs/fabric');

module.exports = {
  ...fabric.prettier,
  tabWidth: 2,
  printWidth: 120,
  singleQuote: true,
};
