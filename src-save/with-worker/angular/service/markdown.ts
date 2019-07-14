import {Injectable} from '@angular/core';
import {Layout} from '../layout/cory-layout';
const Worker = require(`../../worker/markdown.worker.js`);
const worker = new Worker();

@Injectable()
export class MarkdownService {

    public context: any;
    layout: Layout;

    constructor() {
    }

    public render(md: string, layout: Layout) {
        this.layout = layout;

        return new Promise((resolve, reject) => {
            const message =  (event: any) => {
                resolve(event.data)
                worker.removeEventListener('message', message)
            }

            worker.addEventListener('message', message)

            worker.postMessage({
                md: md,
                settings: this.context.settings.data,
                currentRepo: this.layout.currentRepo,
            });
        })
    }
}
