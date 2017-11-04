import {
    Component,
    Host,
    OnInit, Input, NgModule, NgModuleFactory, Compiler
} from '@angular/core';

import {
    ActivatedRoute,
} from '@angular/router';

import { RouterService } from 'corifeus-web';

import { Layout } from '../layout/cory-layout';

import { CdnService, MarkdownService  } from '../service';

import { SettingsService } from 'corifeus-web';

@Component({
    selector: 'cory-page',
    template: `
        <ng-container *ngComponentOutlet="dynamicComponent;
                            ngModuleFactory: dynamicModule;"></ng-container>
`
})

export class Page implements OnInit {

    content: any;

    dynamicComponent: any;
    dynamicModule: NgModuleFactory<any>;


    constructor(
        @Host() public parent: Layout,
        private markdown: MarkdownService,
        private cdn: CdnService,
        private router: RouterService,
        private route: ActivatedRoute,
        private settings: SettingsService,
        private compiler: Compiler,

    ) {
        this.markdown.context = this;

        this.route.url.subscribe((segment) => {
            const path = segment.join('/');
            this.navigate(path);
        })
    }

    ngOnInit() {
        this.dynamicComponent = this.createNewComponent(this.content, this);
        this.dynamicModule = this.compiler.compileModuleSync(this.createComponentModule(this.dynamicComponent));
    }

    protected createComponentModule (componentType: any) {
        @NgModule({
            imports: [],
            declarations: [
                componentType
            ],
            entryComponents: [componentType]
        })
        class RuntimeComponentModule
        {
        }
        // a module for just this Type
        return RuntimeComponentModule;
    }


    protected createNewComponent (text:string, contextInput: any) {
        let template = `${text}`;

        @Component({
            selector: 'dynamic-component',
            template: template
        })
        class DynamicComponent implements OnInit{
            text: any;
            context: any;

            ngOnInit() {
                this.text = text;
                this.context = contextInput;
            }

        }

        return DynamicComponent;
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

            this.dynamicComponent = this.createNewComponent(this.content, this);
            this.dynamicModule = this.compiler.compileModuleSync(this.createComponentModule(this.dynamicComponent));
        } catch(e) {
            console.log(e);
            this.router.navigateTop(['/github/corifeus/404']);
        }
    }
}

