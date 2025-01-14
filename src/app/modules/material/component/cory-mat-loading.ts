import {
    Input,
    Component,
} from '@angular/core';

import { GlobalService} from "../../../service/global.service";
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { NgIf } from '@angular/common';

@Component({
    selector: 'cory-mat-loading',
    template: `
<mat-progress-bar
style="position: fixed; top: 0px; left: 0px; width: 100%; z-index: 100000;"
*ngIf="visible || globalService.HttpCounter > 0"
color="primary"
mode="indeterminate"></mat-progress-bar>
`,
    imports: [NgIf, MatProgressBarModule]
})
export class Loading {

    @Input('cory-visible')
    visible: boolean = false;

    constructor(
        public globalService: GlobalService
    ) {

        //   console.log(this.visible);
    }
}
