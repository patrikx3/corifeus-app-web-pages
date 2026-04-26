import {
    Component,
    NgZone,
    AfterViewChecked,
    Inject,
    effect,
    computed,
    resource,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { httpResource } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

import { ActivatedRoute, Params, UrlSegment } from '@angular/router';

import { Layout } from '../layout';

import { CdnService, MarkdownService } from '../service';

import { LocaleService, SettingsService } from '../modules/web';

import twemoji from 'twemoji';

import { NotifyService } from '../modules/material';
import { environment } from '../../environments/environment';

let readyNotified = false;

@Component({
    selector: 'cory-page',
    template: `
        <span id="cory-page-content" [innerHTML]="safeContent"></span>
    `,
    standalone: true,
})
export class Page implements AfterViewChecked {

    loaded = false;

    safeContent: SafeHtml = '';

    constructor(
        private markdown: MarkdownService,
        private cdn: CdnService,
        private activatedRoute: ActivatedRoute,
        /* Used by MarkdownService via this.context.settings — keep the
           injection even though Page.ts itself never reads it. */
        public settings: SettingsService,
        private zone: NgZone,
        protected notify: NotifyService,
        protected locale: LocaleService,
        private sanitizer: DomSanitizer,
        @Inject(DOCUMENT) private document: Document,
        private parent: Layout,
    ) {
        this.markdown.context = this;

        if (typeof window !== 'undefined') {
            (window as any)['coryPageCopy'] = (codeId: any) => {
                this.zone.run(() => {
                    const codeEl = this.document.getElementById(`code-${codeId}`);
                    if (codeEl && typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(codeEl.innerText);
                        this.notify.info('Copied!');
                    }
                });
            };
        }

        /* Signal-native routing:
             - urlSig  tracks the child's own url segments (sub-page nav /repo/foo)
             - paramsSig tracks the parent :repo param (cross-repo nav, where
               the child's segments stay []). */
        const parentRoute = this.activatedRoute.parent ?? this.activatedRoute;
        const urlSig = toSignal(this.activatedRoute.url, { initialValue: [] as UrlSegment[] });
        const paramsSig = toSignal(parentRoute.params, { initialValue: {} as Params });

        const path = computed(() => {
            const joined = urlSig().map(s => s.path).join('/');
            return joined || 'index.html';
        });
        const repo = computed(() => paramsSig()['repo'] as string | undefined);

        /* Reactive CDN URL — recomputes when (repo, path) changes. */
        const cdnUrl = computed(() => {
            const r = repo();
            const p = path();
            if (!r) return undefined;
            return this.cdn.url(r, p);
        });

        /* httpResource handles the fetch, transfer-state caching on SSR,
           cancellation when the URL changes, and exposes value/error/isLoading
           as signals. */
        const cdnText = httpResource.text(() => cdnUrl());

        /* resource() projects (text, path) into rendered markdown HTML. It
           auto-cancels the previous in-flight markdown render when the inputs
           change, so a fast repo-switch won't race. */
        type RenderParams = {
            text: string | undefined;
            error: Error | undefined;
            path: string;
        };
        const renderedHtml = resource<string, RenderParams>({
            params: () => ({
                text: cdnText.value(),
                error: cdnText.error(),
                path: path(),
            }),
            defaultValue: '',
            loader: async ({ params }) => {
                if (params.error) throw params.error;
                if (!params.text) return '';

                const pLower = params.path.toLowerCase();
                let text = params.text;

                if (pLower.endsWith('.json')) {
                    text = `\n\`\`\`json\n${text}\n\`\`\`\n`;
                } else if (pLower.endsWith('.yml')) {
                    text = `\n\`\`\`yaml\n${text}\n\`\`\`\n`;
                } else if (pLower.endsWith('.conf')) {
                    text = `\n\`\`\`nginxconf\n${text}\n\`\`\`\n`;
                }

                return await this.markdown.render(text, this.parent, pLower);
            },
        });

        /* Apply twemoji + sanitize whenever the rendered HTML or error changes. */
        effect(() => {
            const html: string = renderedHtml.value() ?? '';
            const err = renderedHtml.error();

            const body: string = err ? this.render404(err) : html;

            const options = environment.production
                ? { folder: 'svg', ext: '.svg', base: '/assets/twemoji/' }
                : { folder: 'svg', ext: '.svg', base: 'http://twemoji.maxcdn.com/v/latest/' };

            const withEmoji = twemoji.parse(body, options);
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(withEmoji);
        });
    }

    private render404(e: any): string {
        const msg = e?.message ?? '';
        const loc = typeof location !== 'undefined' ? location.toString() : '';
        const i18n404 = this.locale.data?.material?.http?.['404'] ?? 'Not found';
        return `
            <div style="margin-top: 20px; font-size: 6em; opacity: 0.25;" status-code="404">
                404
            </div>
            <div style="font-size: 3em; opacity: 0.75;">
                <i class="fas fa-thumbs-down"></i> ${i18n404}
            </div>
            <div style="text-overflow: ellipsis; overflow: hidden; opacity: 0.7">${loc}</div>
            <br/>
            <div style="opacity: 0.5">${msg}</div>
        `;
    }

    ngAfterViewChecked() {
        const hash = typeof location !== 'undefined' ? location.hash : '';
        const e = hash ? this.document.querySelector(`${hash}-parent`) : null;
        if (!this.loaded && e) {
            this.loaded = true;
            e.scrollIntoView({ block: 'center' });
        }
        if (!readyNotified) {
            readyNotified = true;
            this.notify.info(this.parent.i18n.title.ready);
        }
    }
}
