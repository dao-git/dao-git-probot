
module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('pull_request.opened', async context => {
      var bodyComment = "I am writing test msgs to test:"

      //HARDCODED TRASH
      const owner = 'dao-git';
      const repo = 'dao-git-test';
      const anon = 0; //We dont want to out anonymous contributors
      //
      const  contributors = await context.github.repos.listContributors({
        owner, repo, anon
      }).then(({data, status, headers}) => {
        app.log(data)
        for(var contributor in data)){
          app.log(contributor)
          app.log(contributor.login)
          app.log(JSON.parse(contributor))
        }
      })
      // app.log(contributors.data)
      // for (var contributor in contributors.data) {
      //   app.log(contributor)
      //   contributor_obj = JSON.parse(contributor)
      //   app.log(contributor_obj)
      //   bodyComment += ""+contributor_obj.login+" "
      // }
      const comment = context.issue({body: bodyComment})
      return context.github.issues.createComment(comment)
  })



  //app.on('issues.opened', async context => {
  //  const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
  //  return context.github.issues.createComment(issueComment)
  //})
  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
