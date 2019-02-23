const Web3 = require('web3')
const web3 = new Web3(new Web3.providers.HttpProvider('https://rinkeby.infura.io/'))

module.exports = app => {
  app.log('Yay, the app was loaded!')

  app.on(['pull_request.opened', 'pull_request.reopened'], async context => {
      var bodyComment = "Hi \n"
      var pull_request_id = context.payload.pull_request.number
      var repo_id = context.payload.repository.full_name
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
      bodyComment += "\n please vote [here](https://dao-git.github.io/fe/?repo="
                  +hex_repo_id
                  +"&pr="
                  +pull_request_id
                  +")."
      const comment = context.issue({body: bodyComment})
      return context.github.issues.createComment(comment)
  })

  app.on('issue_comment.created', async context => {
    var contract_address = '0x3538716fd0f6bf656cbf12506ba4cc73979d3503';
    var contract = new web3.eth.Contract(
	[{
		"constant": true,
		"inputs": [
			{
				"name": "_repoId",
				"type": "bytes32"
			},
			{
				"name": "_pullRequestId",
				"type": "uint256"
			}
		],
		"name": "isPassing",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	}
], contract_address);
    app.log(contract_address)
    var pull_request_id = context.payload.issue.number
    var repo_id = context.payload.repository.full_name
    var hex_repo_id = web3.utils.fromAscii(repo_id);
    contract.methods.isPassing(hex_repo_id, pull_request_id).call().then(result => {
      if(result){
        app.log(result)
        var split_repo_id = repo_id.split('/')
        const owner = split_repo_id[0]
        const repo = split_repo_id[1]
        const base = 'master'
        const number = pull_request_id
        context.github.pullRequests.merge({
          owner,
          repo,
          number
        })
      }
    })
  })
}
