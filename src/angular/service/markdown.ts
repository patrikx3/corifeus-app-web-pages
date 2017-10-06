import { Injectable } from '@angular/core';

const hljs = require('highlight.js/lib/highlight.js');
hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml.js'));
hljs.registerLanguage('css', require('highlight.js/lib/languages/css.js'));
hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss.js'));
hljs.registerLanguage('powershell', require('highlight.js/lib/languages/powershell.js'));
hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript.js'));
hljs.registerLanguage('json', require('highlight.js/lib/languages/json.js'));
hljs.registerLanguage('bash', require('highlight.js/lib/languages/shell.js'));
hljs.registerLanguage('typescript', require('highlight.js/lib/languages/typescript.js'));

import * as marked from 'marked';

import { Layout } from '../layout/cory-layout';

import { IsBot } from 'corifeus-web';

@Injectable()
export class MarkdownService {
    markdownRenderer: any = new marked.Renderer();

    public context : any;

    layout: Layout;

    constructor() {

        this.markdownRenderer.image = (href: string, title: string, text: string) => {
            title = title || '';
            text = text || '';
            if (!href.startsWith('http')) {
                href = `https://cdn.corifeus.com/git/${this.layout.currentRepo}/${href}`;
            }
            const result = `
<span style="display: block; font-size: 125%; opacity: 0.5">
${title}
</span>
<a href="${href}" target="_blank"><img src="${href}"/></a>
<span style="display: block; text-align: right; opacity: 0.5">
${text}
</span>
`;
            return result;
        };

        this.markdownRenderer.link = (href: string, title: string, text: string) => {
            let a;
            let tooltip = '';
            if (title !== null ) {
                tooltip = `matTooltip="${title}" matTooltipPosition="above"`;
            }
            let fixed = false;
            let path;
            if (href.includes(`/${this.context.settings.data.pages.defaultDomain}/`)) {
                const url = new URL(href);
                href = url.pathname.substr(1);
                path = `github/${href}/index.html`;
                fixed = true;
            }
            if (!href.startsWith(location.origin) && (href.startsWith('https:/') || href.startsWith('http:/'))) {
                a = `<span class="cory-layout-link-external"><a color="accent" target="_blank" ${tooltip} href="${href}">${text}</a> <i class="fa fa-external-link"></i></span>`;
            } else {
                if (!fixed) {
//                    console.log('not fixed');
//                    console.log(href);
                    if (href.endsWith('.md')) {
                        href = href.substr(0, href.length - 3) + '.html';
                    }
                    if (href.startsWith(location.origin)) {
                        path = href.substring(location.origin.length + 1)
                    } else {
                        path = `github/${this.context.parent.currentRepo}/${href}`;
                    }
                }
                a = `<a href="/${path}" ${IsBot() ? '' : 'onclick="return false;"'} (click)="this.context.parent.navigate('${path}')" ${tooltip}>${text}</a>`;
//                console.log(path);
//                console.log(a);
            }
            return a;
        }

        this.markdownRenderer.code = (code :string, language :string) => {
            if (language === undefined) {
                language = 'text';
            }

            if ((hljs.getLanguage(language) === 'undefined' ||  hljs.getLanguage(language) === undefined) && language !== 'text') {
                console.error(`Please add highlight.js as a language (could be a marked error as well, sometimes it thinks a language): ${language}                
We are not loading everything, since it is about 500kb`)
            }
           language = language === 'text' || language === undefined ? 'html' : language;
            const validLang = !!(language && hljs.getLanguage(language));
            const highlighted = validLang ? hljs.highlight(language, code).value : code;
            return `<pre><code class="hljs ${language}">${highlighted}</code></pre>`;
        };

        this.markdownRenderer.codespan = (code: string) => {
            const lang = 'html';
            const highlighted = hljs.highlight(lang, code).value ;
            return `<code style="display: inline; line-height: 34px;" class="hljs ${lang}">${highlighted}</code>`;
        }
    }

    private extract(template: string, area: string) : string {
        //   [//]: #@corifeus-header
        //   [//]: #corifeus-header:end
        //   [//]: #@corifeus-footer
        //   [//]: #@corifeus-footer:end
        const start = `[//]: #@${area}`;
        const end = `[//]: #@${area}:end`;
        const startIndex = template.indexOf(start);
        const endIndex = template.indexOf(end);
        let result : string = template.substring(0, startIndex);
        result += template.substring(endIndex);
        return result;
    }

    public render(md: string, layout: Layout ) {
        this.layout = layout;

        md = this.extract(md, 'corifeus-header');
        md = this.extract(md, 'corifeus-footer');

        let html = marked(md, {
            renderer: this.markdownRenderer
        });

        html = html.replace(/{/g, '&#123;<span style="display: none;"></span>').replace(/}/g, '&#125;');
        html = html.replace(/&amp;/g, '&');

        return html;
    }
}