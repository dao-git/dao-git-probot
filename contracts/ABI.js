[
	{
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
	},
	{
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
		"name": "votesNeeded",
		"outputs": [
			{
				"name": "",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_repoId",
				"type": "bytes32"
			},
			{
				"name": "_passingThreshold",
				"type": "uint256"
			}
		],
		"name": "createRepo",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_repoId",
				"type": "bytes32"
			},
			{
				"name": "_address",
				"type": "address"
			}
		],
		"name": "revokeWhitelist",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": false,
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
		"name": "approvePullRequest",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "",
				"type": "bytes32"
			}
		],
		"name": "repo",
		"outputs": [
			{
				"name": "manager",
				"type": "address"
			},
			{
				"name": "passingThreshold",
				"type": "uint256"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": false,
		"inputs": [
			{
				"name": "_repoId",
				"type": "bytes32"
			},
			{
				"name": "_address",
				"type": "address"
			}
		],
		"name": "whitelist",
		"outputs": [],
		"payable": false,
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "_repoId",
				"type": "bytes32"
			},
			{
				"name": "_address",
				"type": "address"
			}
		],
		"name": "isWhiteListed",
		"outputs": [
			{
				"name": "",
				"type": "bool"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"constant": true,
		"inputs": [
			{
				"name": "source",
				"type": "string"
			}
		],
		"name": "stringToBytes32",
		"outputs": [
			{
				"name": "result",
				"type": "bytes32"
			}
		],
		"payable": false,
		"stateMutability": "pure",
		"type": "function"
	},
	{
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
		"name": "getVotes",
		"outputs": [
			{
				"name": "",
				"type": "address[]"
			}
		],
		"payable": false,
		"stateMutability": "view",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"name": "_repoId",
				"type": "bytes32"
			},
			{
				"indexed": false,
				"name": "_pullRequestId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"name": "passing",
				"type": "bool"
			}
		],
		"name": "approved",
		"type": "event"
	}
]
