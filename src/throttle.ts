export class Throttle {
    public timer: any;
    public queue: any = [];
    public lastTimeApiCalled = Date.now();
    public numberOfRequest: number
    public retryAfter: number
    public numberOfRemaingRequests: number
    public timerForRestnumOfReq: any

    constructor(numOfReq: number, retryAfter: number) {
        this.numberOfRequest = numOfReq || 5;
        this.retryAfter = retryAfter || 10000;
        this.numberOfRemaingRequests = this.numberOfRequest;
    }
    private rateLimit() {
        clearTimeout(this.timerForRestnumOfReq);
        let checkIfRequestWithinTime = this.retryAfter + this.lastTimeApiCalled;
        let dateNow = Date.now();
        if (dateNow < checkIfRequestWithinTime && !this.numberOfRemaingRequests) {
            if (this.timer) {
                clearTimeout(this.timer);
                this.timer = setTimeout(this.rateLimit.bind(this), checkIfRequestWithinTime - dateNow);
                return false;
            }
        }
        else {
            let firstRateFromQueue = this.queue.splice(0, this.numberOfRequest);
            firstRateFromQueue.forEach((func: Function) => func());
            if (!this.numberOfRemaingRequests) {
                this.numberOfRemaingRequests = this.numberOfRequest;
            }
            this.numberOfRemaingRequests = this.numberOfRemaingRequests - firstRateFromQueue.length;
            this.lastTimeApiCalled = Date.now();
            if (this.queue.length) {
                this.timer = setTimeout(this.rateLimit.bind(this), this.retryAfter);
            } else {
                this.timer = 0;
                this.timerForRestnumOfReq = setTimeout(()=> this.numberOfRemaingRequests = this.numberOfRequest , this.retryAfter);
            }
        }

    }
    public getReports(fetchFun: Function) {
        let checkIfRequestWithinTime = this.retryAfter + this.lastTimeApiCalled;
        let dateNow = Date.now();
        this.queue.push(fetchFun);
        if (dateNow > checkIfRequestWithinTime || this.numberOfRemaingRequests) {
            this.timer = setTimeout(this.rateLimit.bind(this), 0);

        }
        else {
            this.timer = setTimeout(this.rateLimit.bind(this), this.retryAfter);
        }

    }

} 