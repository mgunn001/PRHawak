var chai = require('chai');
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
    it('should get user account does not exist', async function () {
        await gitRepoService.getAllPublicReposOnUser("mgunn000").then(userReposData => {
            console.log('User Repos:', userReposData);         
        }, error => {
            const errMsg = error.message; 
            expect(errMsg).to.equal("User account does not exist");
        });
    });
});



/* 
* list of test cases to writte -- Couldn't write all these, focused more on functionality
* 1.Verify the Repo is in the Desc by count of Open Pull.
* 2.While pulling the pull requests, sate should be only open.
* 3.Provide wrong repo name.
* 4.Provide an user name who doesn't have any public repo.
* 5.Test the system with examples of repo count with some large number and so on.
*/
