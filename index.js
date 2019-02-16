const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'))

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')
  app.log(web3.utils.fromAscii('dao-git/dao-git-test'))

  app.on('pull_request.opened', async context => {
      var bodyComment = "Hi \n"
      var pull_request_id = context.payload.pull_request.number
      var repo_id = context.payload.pull_request.head.repo.full_name
      app.log(repo_id)
      var hex_repo_id = web3.utils.fromAscii(repo_id);
      var split_repo_id = repo_id.split('/')
      const owner = split_repo_id[0]
      const repo = split_repo_id[1]
      app.log(hex_repo_id)
      const anon = 0; //We dont want to out anonymous contributors

      const  contributors = await context.github.repos.listContributors({
        owner, repo, anon
      }).then(({data}) => {
        data.map(contributor => {
          bodyComment += "@"+contributor.login+" "
        })
      })
      bodyComment += "\n please vote at https://oneclickdapp.com/status-picnic/ \n with *pull request id*: "
      +pull_request_id
      +"\n and *repo id*: "
      + hex_repo_id

      const comment = context.issue({body: bodyComment})
      return context.github.issues.createComment(comment)
  })
}
