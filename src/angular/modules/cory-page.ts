import {
    Component,
    Host,
    NgModule,
} from '@angular/core';

import {
    ActivatedRoute,
} from '@angular/router';

import {
    Http
} from '@angular/http';

import { RouterService } from 'corifeus-web';

import { Layout } from '../layout/cory-layout';

import { CdnService, MarkdownService  } from '../service';

import { SettingsService } from 'corifeus-web';

@Component({
    selector: 'cory-page',
    template: `
        <span [innerHTML]="content | coryHtml"></span>
    `
})

export class Page  {

    content: any;

    constructor(
        @Host() public parent: Layout,
        private markdown: MarkdownService,
        private cdn: CdnService,
        private router: RouterService,
        private route: ActivatedRoute,
        public http: Http,
        private settings: SettingsService
    ) {
        this.markdown.context = this;

        this.route.url.subscribe((segment) => {
            const path = segment.join('/');
            this.navigate(path);
        })
    }

    async navigate(path? : string) {
        if (path === undefined || path === '') {
            path = `index.html`;
        };
        try {

            const response = await this.cdn.file(this.parent.currentRepo, path);
            let text = response.text();

            if (path.toLowerCase().endsWith('.json')) {
                text = `
\`\`\`json
${text}
\`\`\`                    
`
            } else if (path.toLowerCase().endsWith('.yml')) {
                text = `
\`\`\`yaml
${text}
\`\`\`                    
`


            }

            this.content = this.markdown.render(text, this.parent);

        } catch(e) {
            this.router.navigateTop(['/github/corifeus/404']);
        }
    }
}

