import {
  Input,
  Component,
  ChangeDetectionStrategy
} from '@angular/core';

import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
    selector: 'cory-mat-loading',
    template: `
@if (visible) {
  <mat-progress-bar
    style="position: fixed; top: 0px; left: 0px; width: 100%; z-index: 100000;"
    color="primary"
  mode="indeterminate"></mat-progress-bar>
}
`,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [MatProgressBarModule],
})
export class Loading {

    @Input('cory-visible')
    visible: boolean = false;
}
