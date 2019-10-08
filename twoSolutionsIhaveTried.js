
/************************************************************** */
// first try using exponential backoff
var failArr = [];
var counter = 0;
function fetch_retry(url, options, n) {
    return new Promise(function (resolve, _reject) {
        fetch(url, options)
            .then(function (result) {
                if (result.status == 429) {
                    counter++;
                    var resetTime;
                    result.headers.forEach(function (value, name) {
                        if ('x-ratelimit-reset' == name) {
                            resetTime = Math.floor(new Date(value * 1000).getTime() - new Date().getTime());
                            console.log(resetTime, 'reset');
                        }
                    });
                    let indexOfCurrentFail, expontaiontalTimeToRetry, counter2
                    if (!n) {
                        counter2 = counter;
                        failArr.push(counter2);
                        var exp = failArr.indexOf(counter) + 1;
                        expontaiontalTimeToRetry = Math.ceil((exp) / 5);
                        console.log(expontaiontalTimeToRetry, 'exp');
                    }
                    else {
                        counter2 = n;
                        var exp = failArr.indexOf(n) + 1;
                        expontaiontalTimeToRetry = Math.ceil(exp / 5);
                        console.log(expontaiontalTimeToRetry, 'exp');


                    }

                    setTimeout(() => {
                        fetch_retry(url, options, counter2)
                            .then(resolve)
                    }, expontaiontalTimeToRetry ? 10000 * expontaiontalTimeToRetry : 10000)
                }           /* on success */
                else {
                    if (n) {
                        var index = failArr.indexOf(n);

                        failArr.splice(index, 1);

                    }
                    resolve(result);
                }
            })
            .catch(function (error) {
                console.log(error);
                fetch_retry(url, options)
                    .then(resolve)
                // <--- simply resolve
            })
    });
}

var i = 0;
while (i < 30) {
    fetch_retry('https://dummy.qentinel-api.com/api/reports', {}).then((res) => {
        console.log(res.text())
    });
    i++;

}
/************************************************************** */
// second try using throttle with rate limit

var timer;
var queue = [];
var lastTimeApiCalled = Date.now();
let numberOfRequest = 5;
let retryAfter = 10000;
let numberOfRemaingRequests = numberOfRequest;
function rateLimit() {
    let checkIfRequestWithinTime = retryAfter + lastTimeApiCalled, dateNow = Date.now();
    if (dateNow < checkIfRequestWithinTime && !numberOfRemaingRequests) {
        if (timer) {
            clearTimeout(timer);
            timer = setTimeout(rateLimit, checkIfRequestWithinTime - dateNow);
            return false;
        }
    }
    else {
        let firstRateFromQueue = queue.splice(0, numberOfRequest);
        firstRateFromQueue.forEach((func) => func());
        if (!numberOfRemaingRequests) {
            numberOfRemaingRequests = numberOfRequest;
        }
        numberOfRemaingRequests = numberOfRemaingRequests - firstRateFromQueue.length;
        lastTimeApiCalled = Date.now();
        if (queue.length) {
            timer = setTimeout(rateLimit, retryAfter);
        } else {
            timer = 0;
        }
    }

}
function getReports(fetchFun) {
    let checkIfRequestWithinTime = retryAfter + lastTimeApiCalled, dateNow = Date.now();
    queue.push(fetchFun);
    if (dateNow > checkIfRequestWithinTime || numberOfRemaingRequests) {
        timer = setTimeout(rateLimit, 0);

    }
    else {
        timer = setTimeout(rateLimit, retryAfter);
    }

}