module.exports = function (req, res) {
  res.writeHead(302, {
    Location: 'https://github.com/gary-Shen/candi-tab',
  })
  res.end()
}
