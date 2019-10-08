import express from 'express';
import axios from 'axios';
import {Throttle} from './throttle';
const app = express();
let throWrapperFunc = new Throttle(5,10000);

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
app.get('/index.js', (req, res) => res.sendFile(__dirname + '/public/index.js'));
app.get('/*', (req, res) => res.sendFile(__dirname + '/public/index.html'));
app.listen(process.env.PORT || 3000, () => console.log('Example app listening on port 3000!'));
