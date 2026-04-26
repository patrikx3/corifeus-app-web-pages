import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Layout } from '../layout/cory-layout';
import { constructMarkdown } from '../../worker/markdown-core';
import nextId from '../utils/next-id.js';

@Injectable()
export class MarkdownService {

    public context: any;
    layout: Layout;

    private worker: Worker | null = null;

    constructor(@Inject(PLATFORM_ID) private platformId: Object) {
        if (isPlatformBrowser(this.platformId)) {
            this.worker = new Worker(
                new URL('../../worker/markdown.worker', import.meta.url),
                { type: 'module' },
            );
        }
    }

    public async render(md: string, layout: Layout, path: string): Promise<string> {
        this.layout = layout;

        if (this.layout.packages === undefined) {
            await new Promise<void>((resolve) => {
                const wait = () => {
                    if (this.layout.packages === undefined) {
                        setTimeout(wait, 100);
                    } else {
                        resolve();
                    }
                };
                wait();
            });
        }

        const locationSnapshot = isPlatformBrowser(this.platformId)
            ? JSON.parse(JSON.stringify(window.location))
            : {
                origin: 'https://corifeus.com',
                pathname: '/' + (this.layout.currentRepo || 'matrix'),
                href: 'https://corifeus.com/' + (this.layout.currentRepo || 'matrix'),
                hostname: 'corifeus.com',
            };

        const payload = {
            md,
            settings: this.context.settings.data,
            currentRepo: this.layout.currentRepo,
            packages: this.layout.packages,
            path,
            location: locationSnapshot,
        };

        if (!this.worker) {
            return constructMarkdown(payload);
        }

        return this.renderInWorker(payload);
    }

    private renderInWorker(payload: any): Promise<string> {
        return new Promise((resolve, reject) => {
            const requestId = nextId();
            const onMessage = (event: MessageEvent) => {
                if (event.data.requestId === requestId) {
                    this.worker!.removeEventListener('message', onMessage);
                    if (event.data.success === true) {
                        resolve(event.data.html);
                    } else {
                        reject(new Error(event.data.errorMessage));
                    }
                }
            };

            this.worker!.addEventListener('message', onMessage);
            this.worker!.postMessage({ ...payload, requestId });
        });
    }
}
