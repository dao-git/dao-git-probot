# Code DAO's

### Allow your community to manage your code using a [DAO]([DAO](https://en.wikipedia.org/wiki/Decentralized_autonomous_organization))! Pull requests are automatically merged using a set-and-forget voting contract and a [Github bot](https://github.com/apps/dao-git-probot).

## Getting Started
1. Install the [Code DAO bot](https://github.com/apps/dao-git-probot) to your github repository. 
2. Create a new PR and follow the bot's instructions for initializing your repository and setting a voting threshold (the minimum number of votes required for merging.
3. Add members to your DAO by whitelisting their ethereum addresses. (Fortmatic Recommended, link included in bot's comments)
4. Once initialized, members of the DAO can now vote on new PRs. 
5. Upon each comment on the Pull Request, the bot checks the if the voting threshold has been reached, and if so, automatically merges.
  
## How to Contribute
If you have suggestions for how dao-git-probot could be improved, or want to report a bug, open an issue! We'd love all and any contributions. We currently use the Code DAO to manage this repository as well. 
1. Get whitelisted here https://github.com/dao-git/dao-git-probot/issues/2
2. Make a pull request with your changes
3. Wait for contributors to vote (be sure to vote yourself!)
4. Once `votingThreshold` is met, make a comment in the pull request to trigger the bot to merge.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## Development
```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## History
Made at ETHDenver2019, check out our submission [here](https://kauri.io/article/a20c2d43ab954852a48227c5dd4eed99/v6/allow-your-community-to-manage-your-code-using-a-dao!)!

## License
[ISC](LICENSE)
