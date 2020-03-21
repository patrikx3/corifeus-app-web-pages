import {Injectable} from '@angular/core';
import {Layout} from '../layout/cory-layout';
const Worker = require(`../../../../worker/markdown.worker`);
const worker = new Worker();

const nextId  = require('../utils/next-id.js')

@Injectable()
export class MarkdownService {

    public context: any;
    layout: Layout;

    constructor() {
    }

    public render(md: string, layout: Layout, path: string) {
        this.layout = layout;

        return new Promise((resolve, reject) => {
            const requestId = nextId()
            const message =  (event: any) => {
                if (event.data.requestId === requestId) {
                    worker.removeEventListener('message', message)
                    if (event.data.success === true) {
                        resolve(event.data.html)
                    } else {
                        reject(new Error(event.data.errorMessage));
                    }
                }
            }

            worker.addEventListener('message', message)

            worker.postMessage({
                md: md,
                settings: this.context.settings.data,
                currentRepo: this.layout.currentRepo,
                packages: this.layout.packages,
                requestId: requestId,
                path: path,
            });
        })
    }
}
