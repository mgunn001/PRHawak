/**
* An objective representation of an user Repo
* @param url The URL for the repo
* @param name The name of the repository
* @param openPulls The number of open pull requests on the repository
*/
function Repository(id, url, name, openPulls) {

	this.url = url;
	this.id = id;
	this.name = name;
	//console.log("inside building Repository, url ->  "+url)
	this.openpulls = openPulls;
};

module.exports = {
	Repository: Repository
}
