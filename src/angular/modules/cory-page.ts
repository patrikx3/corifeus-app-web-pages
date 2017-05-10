import {
    Component,
    Host
} from '@angular/core';

import {
    ActivatedRoute,
} from '@angular/router';

import {
    Http
} from '@angular/http';

import { RouterService } from 'corifeus-web';

import { MaterialModule } from '@angular/material';

import { Layout } from '../layout/cory-layout';

import { GitHubService, MarkdownService  } from '../service';

import { SettingsService } from 'corifeus-web';

@Component({
    selector: 'cory-page',
    template: `    
    <span [p3x-compile]="content" [p3x-compile-ctx]="context" [p3x-compile-imports]="imports">
    </span>
`
})


export class Page  {

    context: Page;
    imports: any[] = [ MaterialModule ];

    content: any;

    constructor(
        @Host() public parent: Layout,
        private markdown: MarkdownService,
        private gitHub: GitHubService,
        private router: RouterService,
        private route: ActivatedRoute,
        public http: Http,
        private settings: SettingsService
    ) {
        this.context = this;
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

            const response = await this.gitHub.file(this.parent.currentRepo, path);
            let text = response.text();
            if (path.toLowerCase().endsWith('.json')) {
               text = `
\`\`\`json
${text}
\`\`\`                    
`
            }
            this.content = this.markdown.render(text);

        } catch(e) {
            this.router.navigateTop(['/github/corifeus/404']);
        }
    }
}

