const Web3 = require("web3");
const Twitter = require('twitter')
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://rinkeby.infura.io/")
);
const contract_address = "0xD9A37024b41f0c13cF85eeADcaE257181b965da3";

var client = new Twitter({
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET
})

contract_interface = [
  {
    constant: true,
    inputs: [
      {
        name: "_repoId",
        type: "bytes32"
      },
      {
        name: "_pullRequestId",
        type: "uint256"
      }
    ],
    name: "isPassing",
    outputs: [
      {
        name: "",
        type: "bool"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  },
  {
    constant: true,
    inputs: [
      {
        name: "",
        type: "bytes32"
      }
    ],
    name: "repo",
    outputs: [
      {
        name: "manager",
        type: "address"
      },
      {
        name: "passingThreshold",
        type: "uint256"
      }
    ],
    payable: false,
    stateMutability: "view",
    type: "function"
  }
];

module.exports = app => {
  app.log("Yay, the app was loaded!");
  app.log(process.env.CONSUMER_KEY);
  app.on(["pull_request.opened", "pull_request.reopened"], async context => {

    client.post('statuses/update', {status: `Pull request opened in ${context.payload.repository.full_name}!\n-`}, (err, tweet, res) => {
      if(err) throw err
      app.log(tweet)
      app.log(res)
    });
    //gather contributors
    var repo_id = context.payload.repository.full_name;
    var hex_repo_id = web3.utils.fromAscii(repo_id);
    var bodyComment = "Hello contributors! \n";
    var pull_request_id = context.payload.pull_request.number;
    var split_repo_id = repo_id.split("/");
    const owner = split_repo_id[0];
    const repo = split_repo_id[1];
    const anon = 0; //We dont want to out anonymous contributors
    const contributors = await context.github.repos
      .listContributors({
        owner,
        repo,
        anon
      })
      .then(({ data }) => {
        data.map(contributor => {
          if (contributor.login !='dao-git-probot[bot]'){
          bodyComment += "@" + contributor.login + " ";
          }
        });
      });

   //check if repo has been initialized
    var contract = new web3.eth.Contract(contract_interface, contract_address);
    contract.methods
    .repo(hex_repo_id)
    .call()
    .then(result => {
      if (result) {
        if (result[1] == 0) { //voting threshold
          bodyComment += "\n This repository has not been initialized yet. ";
          bodyComment +=
          "Please click [here](https://dao-git.github.io/front-end/initialize.html" +
          "?repo=" +
          hex_repo_id +
          "&contract=" +
          contract_address +
          ") to set the voting threshold and complete setup.";
          const noRepoComment = context.issue({ body: bodyComment });


          return context.github.issues.createComment(noRepoComment);
        } else {
          app.log("repo initialized");
          bodyComment +=
            "\n Please vote on this pull request [here](https://dao-git.github.io/front-end/" +
            "?repo=" +
            hex_repo_id +
            "&pr=" +
            pull_request_id +
            "&contract=" +
            contract_address +
            ").";
          const comment = context.issue({ body: bodyComment });
          return  context.github.issues.createComment(comment);
        }
      }
    });

   return;
  });


  //check if voting threshold is passed on every comment, if so, merge
  app.on("issue_comment.created", async context => {
    var contract = new web3.eth.Contract(contract_interface, contract_address);
    app.log(contract_address);
    var pull_request_id = context.payload.issue.number;
    var repo_id = context.payload.repository.full_name;
    var hex_repo_id = web3.utils.fromAscii(repo_id);
    contract.methods
      .isPassing(hex_repo_id, pull_request_id)
      .call()
      .then(result => {
        if (result) {
          app.log(result);
          var split_repo_id = repo_id.split("/");
          const owner = split_repo_id[0];
          const repo = split_repo_id[1];
          const base = "master";
          const number = pull_request_id;
          context.github.pullRequests.merge({
            owner,
            repo,
            number
          });
        }
      });
  });
};
