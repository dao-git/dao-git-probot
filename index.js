const Web3 = require("web3");
const web3 = new Web3(
  new Web3.providers.HttpProvider("https://rinkeby.infura.io/")
);
const contract_address = "0xD9A37024b41f0c13cF85eeADcaE257181b965da3";
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

  app.on(["pull_request.opened", "pull_request.reopened"], async context => {
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
          bodyComment += "@" + contributor.login + " ";
        });
      });

  
    var contract = new web3.eth.Contract(contract_interface, contract_address);
    contract.methods
    .repo(hex_repo_id)
    .call()
    .then(result => {
      if (result) {

       app.log("got result from initialization check");

        app.log(result);

        app.log(result[1]);
        // Check if repo has been initialized
        if (result[1] === 0) {
          app.log("no init");

          var bodyNoRepoComment = "This repo has not be set up yet.";
          const noRepoComment = context.issue({ body: bodyNoRepoComment });
          return context.github.issues.createComment(noRepoComment);
        } else {
          app.log("repo initialized");

          bodyComment +=
            "\n please vote [here](https://dao-git.github.io/front-end/" +
            "?repo=" +
            hex_repo_id +
            "&pr=" +
            pull_request_id +
            "&contract=" +
            contract_address +
            ").";
          const comment = context.issue({ body: bodyComment });
          app.log(bodyComment);
          return  context.github.issues.createComment(comment);

        }
    }
    else{
      app.log("no result from initialization check");
      app.log(result);
    }
  });

   return;
  });

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
