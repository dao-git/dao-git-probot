const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'))
const contract_address = '0xD9A37024b41f0c13cF85eeADcaE257181b965da3';

module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
    var bodyComment = 'Hello, \n'
    var pullRequestId = context.payload.pull_request.number
    var repoId = context.payload.repository.full_name
    app.log(repoId)
    var hexRepoId = web3.utils.fromAscii(repoId)
    var splitRepoId = repoId.split('/')
    const owner = splitRepoId[0]
    const repo = splitRepoId[1]
    app.log(hexRepoId)
    const anon = 0 // We dont want to out anonymous contributors
    await context.github.repos.listContributors({
      owner, repo, anon
    }).then(({ data }) => {
      data.map(contributor => {
        bodyComment += '@' + contributor.login + ' '
      })

      bodyComment += "\n please vote [here](https://dao-git.github.io/front-end/"
                  +"?repo="
                  +hex_repo_id
                  +"&pr="
                  +pull_request_id
                  +"&contract="
                  +contract_address
                  +")."
      const comment = context.issue({body: bodyComment})
      return context.github.issues.createComment(comment)
  })

  app.on('issue_comment.created', async context => {
 
    var contract = new web3.eth.Contract(
      [{
        'constant': true,
        'inputs': [
          {
            'name': '_repoId',
            'type': 'bytes32'
          },
          {
            'name': '_pullRequestId',
            'type': 'uint256'
          }
        ],
        'name': 'isPassing',
        'outputs': [
          {
            'name': '',
            'type': 'bool'
          }
        ],
        'payable': false,
        'stateMutability': 'view',
        'type': 'function'
      }
      ], contractAddress)
    app.log(contractAddress)
    var pullRequestId = context.payload.issue.number
    var repoId = context.payload.repository.full_name
    var hexRepoId = web3.utils.fromAscii(repoId)
    contract.methods.isPassing(hexRepoId, pullRequestId).call().then(result => {
      if (result) {
        app.log(result)
        var splitRepoId = repoId.split('/')
        const owner = splitRepoId[0]
        const repo = splitRepoId[1]
        const number = pullRequestId
        context.github.pullRequests.merge({
          owner,
          repo,
          number
        })
      }
    })
  })
}
