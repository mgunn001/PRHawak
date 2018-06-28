# Setup guide
* please navigate to the root folder of the repo and do the following 
* **npm install** - To install all the dependencies required
* **npm test** - To run the test suit
* **npm start** - To start the server
* credentials go in service/credentials.js 
* Service run on port 3001 by default : http://localhost:3001/
* Example URL with github user account specified : http://localhost:3001/user/vuejs


# Approach
* Have fully made use of asynchronous calls for the sake of cucurrency.
* Code is made fully modularised, naming conventions and the comments helps code more readble. 
* Took care of exceptions with the edges cases like -> Invalid github account name, rate limit exceeding, timeout on requests etc.

# Assingment link and pictures 
**Assignment Link** -  http://www.cs.odu.edu/~mgunnam/TakeHomeTask_ServiceNow.pdf




## Requirements

* Node version **8.11.3**
* NPM version **5.6.0**
