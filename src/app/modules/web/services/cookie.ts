import {
    Injectable
} from '@angular/core';

//import * as Cookies from 'js-cookie';

import Cookies from 'js-cookie';

@Injectable()
export class CookieService {

    public get(name: string): string {
        return Cookies.get(name);
    }

    public set(name: string, value: string | any, options?: Cookies.CookieAttributes): void {
        Cookies.set(name, value, options)
    }

    public getAll(): { [key: string]: string } {
        return Cookies.get();
    }

}
