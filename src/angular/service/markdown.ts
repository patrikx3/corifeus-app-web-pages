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

@Injectable()
export class MarkdownService {
    markdownRenderer: any = new marked.Renderer();

    public context : any;

    constructor() {

        this.markdownRenderer.image = (href: string, title: string, text: string) => {
            title = title || '';
            text = text || '';
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
                tooltip = `mdTooltip="${title}" mdTooltipPosition="above"`;
            }

            if (href.startsWith('https:/') || href.startsWith('http:/')) {
                a = `<span class="cory-layout-link-external"><a color="accent" target="_blank" ${tooltip} href="${href}">${text}</a> <i class="fa fa-external-link"></i></span>`;
            } else {
                if (href.endsWith('.md')) {
                    href = href.substr(0, href.length - 3) + '.html';
                }
                const path = `github/${this.context.parent.currentRepo}/${href}`;
                a = `<a href="/${path}" onclick="return false;" (click)="this.context.parent.navigate('${path}')" ${tooltip}>${text}</a>`;
            }
            return a;
        }

        this.markdownRenderer.code = (code :string, language :string) => {
            if (language === undefined) {
                return this.markdownRenderer.codespan(code);
            }
            if (hljs.getLanguage(language) === undefined) {
                console.error(`Please add highlight.js as a language (could be a marked error as well, sometimes it thinks a language): ${language}                
We are not loading everything, since it is about 500kb`)
            }
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

    public render(md: string) {
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