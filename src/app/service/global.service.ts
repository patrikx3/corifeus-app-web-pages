import {Injectable} from '@angular/core';

let httpCounter = 0

@Injectable({
    providedIn: 'root'
})
export class GlobalService {

    public get HttpCounter() {
//        console.log('httpCounter get', httpCounter)
        return httpCounter
    };

    public set HttpCounter(value) {
//        console.log('httpCounter set', value)
        httpCounter = value
    }

}
