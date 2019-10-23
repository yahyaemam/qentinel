import express from 'express';
import axios from 'axios';
import {Throttle} from './throttle';
const app = express();
let throWrapperFunc:Throttle ;

app.use(express.static('public'));
app.get('/getReports', (req, res) => {
    throWrapperFunc.getReports(function(){
    axios.get('https://dummy.qentinel-api.com/api/reports')
    .then(response => {
        res.json({header:response.data});
    })
    .catch(error => {
      console.log(error);
    });
});
});
app.use('/favicon.ico', express.static('/public/favicon.ico'));
app.get('/index.js', (req, res) => res.sendFile(__dirname + '/public/index.js'));

app.get('/*', (req, res) => res.sendFile(__dirname + '/public/index.html'));
(function getRateLimitAndStartApp(){
  let dateNowBeforeRequestStart = Date.now();
  axios.get('https://dummy.qentinel-api.com/api/reports')
  .then(response => {
    let dateNowAfterRequestFininshed = Date.now();
    var requestTime = Math.abs((new Date(dateNowAfterRequestFininshed).getTime() - new Date(dateNowBeforeRequestStart).getTime()) / 1000);
    var TimeBeforeWindowReset = Math.ceil(requestTime) + Math.ceil(( Math.abs((new Date(response.headers['x-ratelimit-reset']*1000).getTime() - new Date(dateNowBeforeRequestStart).getTime()) / 1000)));
    console.log(TimeBeforeWindowReset);
    console.log(response.headers);
    throWrapperFunc = new Throttle(response.headers['x-ratelimit-limit'],TimeBeforeWindowReset*1000);
    app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));
  })
  .catch(error => {
    console.log(error);
    throWrapperFunc = new Throttle(6,10000);
    app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));
  });

})();


