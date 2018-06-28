const express = require('express');
const service = require('../service/gitreposervice');
const path = require('path');
var router = express.Router();
let app = express();


app.engine('pug', require('pug').__express)
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));


router.get('/', function (req, res, next) {
    res.render("index");
});


//ToDO: route to get all repos on User
router.get('/user/:username', async function (req, res, next) {
    console.log("Inside get all repos user route");
    await service.getAllPublicReposOnUser(req.params.username).then(userReposData => {
        console.log('User Repos: ', userReposData);
        res.render("homepage", {
            "responseData": userReposData
        });
    }, error => {
        res.render("error",{
             "responseData": error
        });
    });
});

module.exports = router;
