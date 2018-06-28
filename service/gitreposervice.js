var gitreposervice = function gitreposervice() {
    const requestSA =  require('superagent');
    const Promise = require('promise');
    const btoa = require('btoa');
    const credentials = require('./credentials');
    const repoFramework = require('../lib/repoFramework.js');
    const Repository = repoFramework.Repository;
    const ParseLinkHeader = require('parse-link-header');
    var wholeRepoMap ={};

    /**
     * servic to get all respos on an User with Open PRs
     * handles the githubs pagenation
     */
    this.getAllPublicReposOnUser = async function(userName){
        console.log("Inside getAllPublicReposOnUser");
        userName = userName.trim();
        //https://api.github.com/users/llSourcell/repos
        //https://api.github.com/users/vuejs/repos
        var reposOnUserUrl = "https://api.github.com/users/"+userName+"/repos"; 
        var clientId = credentials.clientid;
        var secret = credentials.secret; 
        var basicAuth = btoa(clientId + ":" + secret); 
        var promise = new Promise(async function (resolve, reject) {
            requestSA
            .get(reposOnUserUrl)
            .set('Authorization',  "Basic "+basicAuth)
            .set('Accept', 'application/json')
            .end(async function(err, res){
              if (err || !res.ok) {
                //console.log(err);
                err.message = "Some problem occured";
                if(res.status == 403){
                   err.message = "Request limit rate exceed";
                }
                if(res.status == 404){
                    err.message = "User account does not exist";
                }

                return reject(err);
              } else {
                //console.log('Hurray got '+ JSON.stringify(res.body));
                try{
                    wholeRepoMap ={};
                    parseRepoResponseBody(res.body);
                    var repoPaginationURLS = parseReposResponseHeader(res.headers); 

                    await makeParallelPaginationRequests(repoPaginationURLS);
                    
                    //console.log("done awaiting for makeParallelPaginationRequests")
                    await makeParallelRequestsForOpenPullsCount();

                   //this is segment for sorting based on the OpenCountNumber
                   let wholeRepoList = Object.values(wholeRepoMap);
                    wholeRepoList.sort(function(repo1, repo2) { 
                        return repo2.openpulls - repo1.openpulls;
                    });
                    return resolve(wholeRepoList);  
                }catch (err) {
                    return reject(err);
                }       
              }
            });
        });
        return promise;
    }



    /**
     * parses all the Github APIs Response body and builds Repository object in the wholeRepoMap
     */
    var parseRepoResponseBody = function (respObj){
        for(let i=0; i < respObj.length;i++){
            let id = respObj[i]['id'];
            let url  = respObj[i]['html_url'];
            let name = respObj[i]['name'];
            let openPullsCount = 0;
            let repo = new Repository(id,url,name,openPullsCount);
            wholeRepoMap[repo.id]=repo;
        }    
    };


    /**
     * parses all the Github APIs Response header for Link conent
     */
    var parseLinkInGitRepHeader = function(respObj){
        let linkContent = respObj.link;
        let parsedObj = null;
        if(linkContent != "" && linkContent != null){
            parsedObj = ParseLinkHeader(linkContent); 
        }
        return parsedObj;
    };



    /**
     *  builds the pagination repo links to requested up on parsed Response header Link conent
     */
    var parseReposResponseHeader= function(respObj){
        let parsedObj = parseLinkInGitRepHeader(respObj)
        let repoPaginationURLS=[];
        if(parsedObj != null){
            let noOfPages = parseInt(parsedObj.last.page);
            let urlOnRequest = parsedObj.last.url.split("?page=")[0];
            for(let i=2; i<=noOfPages; i++){
                repoPaginationURLS.push(urlOnRequest +"?page="+i);
            }
        }
        return repoPaginationURLS;
    };


    /**
     *  method for making the http request for Repos, 
     *  called asyncrhounously for concurrent requests 
     */
    var requestReposOnPageAsync = function(url) {
        var clientId = credentials.clientid; 
        var secret = credentials.secret; 
        var basicAuth = btoa(clientId + ":" + secret);
        return new Promise((resolve, reject) => {
            var req = requestSA
            .get(url)
            .set('Authorization',  "Basic "+basicAuth)
            .set('Accept', 'application/json')
            .end(function(err, res){
                //console.log("Inside -> "+ url);
              if (err || !res.ok) {
                console.log(err);
                return reject(err);
              } else {
                //console.log("requesting for page -> "+ url);
                parseRepoResponseBody(res.body);                
                return resolve(wholeRepoMap);            
              }
            });
        });
    };


    /**
     *  method for making the http request for Open PR count on Repos, 
     *  called asyncrhounously for concurrent requests 
     */
    var requestRepoPullCountAsync = function(repository) {
        // change  vlaue 'all' to 'open'
        var urlForCountOpenPull = "https://api.github.com/repositories/"+repository.id+"/pulls?state=open&per_page=1";    
        return new Promise((resolve, reject) => {
            var clientId = credentials.clientid;
            var secret = credentials.secret; 
            var basicAuth = btoa(clientId + ":" + secret); 
            var req = requestSA
            .get(urlForCountOpenPull)
            .set('Authorization',  "Basic "+basicAuth)
            .set('Accept', 'application/json')
            .end(function(err, res){
                console.log("Inside -> "+ urlForCountOpenPull);
              if (err || !res.ok) {
                console.log(err);
                return reject(err);
              } else {                
                let linkHeaderObj = parseLinkInGitRepHeader(res.headers);  
                let pullCount = 0;
                if(linkHeaderObj == null){
                    pullCount = 0;
                    if(res.body.length != 0){
                        let topObject = (res.body)[0];                                             
                        pullCount = topObject["number"];
                    }               
                }else{
                    pullCount = linkHeaderObj.last.page;
                }
                wholeRepoMap[repository.id].openpulls = pullCount;
                return resolve();
              }
            });
        });
    };


    /**
     * transform requests into Promises, await all
     */
    var makeParallelPaginationRequests = async function(repoPaginationURLS) {
        try {
            if(repoPaginationURLS.length >0 ){
                var data = await Promise.all(repoPaginationURLS.map(requestReposOnPageAsync));
                console.log("Getting full Repos List is Done:" + JSON.stringify(data));
            }
        } catch (err) {
            err.message = "Some problem occured at Github side while fetching public repositories";
            console.error(err);
            throw err;
        } 
    };


    /**
     * transform requests into Promises, await all
     */
    var makeParallelRequestsForOpenPullsCount = async function() {
        try { 
            var data = await Promise.all(Object.values(wholeRepoMap).map(requestRepoPullCountAsync));
            console.log("Getting Pull Counts on each repository is done:" + JSON.stringify(data));
        } catch (err) {
            err.message = "Some problem occured at Github side while fetching Open PR count on repos";
            console.error(err);
            throw err;
        } 
    };

}
gitreposervice.instance = null;

/**
 * Singleton gitreposervice getInstance definition
 * @return singleton class
 */
gitreposervice.getInstance = function () {
    if (this.instance === null) {
        this.instance = new gitreposervice();
    }
    return this.instance;
}
module.exports = gitreposervice.getInstance();