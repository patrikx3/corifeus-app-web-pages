import {Injectable} from '@angular/core';
import {Layout} from '../layout/cory-layout';

const worker = new Worker(new URL('../../worker/markdown.worker', import.meta.url), { type: 'module' });

const nextId  = require('../utils/next-id.js')

@Injectable()
export class MarkdownService {

    public context: any;
    layout: Layout;

    constructor() {
    }

    public render(md: string, layout: Layout, path: string) {
        this.layout = layout;

        return new Promise(async(resolve, reject) => {
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

            if (this.layout.packages === undefined) {
                await new Promise(resolve => {
                    const wait = () => {
                        console.info('waiting for github repo packages')
                        if (this.layout.packages === undefined) {
                            setTimeout(wait, 100)
                        } else {
                            resolve(undefined)
                        }
                    }
                    wait()
                })
            }

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
