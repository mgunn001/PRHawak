var chai = require('chai'),
    https = require('https');
var expect = require('chai').expect;
var should = chai.should();
var request = require('supertest');
var gitRepoService = require('../service/gitreposervice');



describe('Hit the local hosted site with correct user account', function () {
  describe('/user/mgunn001', function () {
    it('should get server status', function (done) {
      var req = request('http://localhost:3001/')
        .get('/user/mgunn001')
        .expect('Content-Type', /json/)
        .expect(200)
        .end(function (err, res) {
          res.body.status.should.equal('OK');
        });
      done();
    });
  });
});


describe('Hit the local hosted site with not an existing user account', function () {
    this.timeout(5000);
    it('should get user account does exist', async function (done) {
        await gitRepoService.getAllPublicReposOnUser("mgunn000").then(userReposData => {
            console.log('User Repos: ', userReposData);         
        }, error => {
            const errMsg = error.message;        
            expect(errMsg).to.equal("User account does not exist");
            done();
        });
    });
});


/* 
* list of test cases to writte
* 1.Provide an unknown username.
* 3.Verify the Repo is in the Desc by count of Open Pull.
* 4.While pulling the pull requests, sate should be only open.
* 5.Provide wrong repo name.
* 6.Provide an user name who doesn't have any public repo.
* 7.Test the system with examples of repo count with some large number and so on.
*
*/
