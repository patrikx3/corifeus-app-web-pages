/// <reference lib="webworker" />

// Import necessary libraries
import { marked } from 'marked';

import kebabCase from 'lodash/kebabCase';
const { extractStars } = require('../helper/extract-stars.function.js');
const IsBot = require('../app/modules/web/util/is-bot.js');
import hljs from 'highlight.js/lib/core';

// Import languages using standard import syntax
import nginx from 'highlight.js/lib/languages/nginx';
import xml from 'highlight.js/lib/languages/xml';
import css from 'highlight.js/lib/languages/css';
import scss from 'highlight.js/lib/languages/scss';
import yaml from 'highlight.js/lib/languages/yaml';
import powershell from 'highlight.js/lib/languages/powershell';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';
import shell from 'highlight.js/lib/languages/shell';
import typescript from 'highlight.js/lib/languages/typescript';
import ini from 'highlight.js/lib/languages/ini';

// Register languages with highlight.js
hljs.registerLanguage('conf', nginx);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('css', css);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('yaml', yaml);
hljs.registerLanguage('yml', yaml);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('json', json);
hljs.registerLanguage('bash', shell);
hljs.registerLanguage('sh', shell);
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('ts', typescript);
hljs.registerLanguage('ini', ini);


// Initialize the custom renderer
const markdownRenderer = new marked.Renderer();

// Initialize counters and variables
let codeIndex: number = 0;

let currentRepo: any;
let settings: any;
let currentRepoPath: any;
let locationOrigin: any;
let locationPathname: any;
let locationHref: any;
let locationHostname: any;

// Helper function to strip HTML tags
function htmlStrip(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
}

// Helper function to sanitize strings to prevent XSS
const sanitize = (str: any): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
};

// Helper function to notify missing markdown code
const notifyMissingMarkdownCode = ({ code, language, currentRepo, currentRepoPath, coreUrl }: any): void => {
    const url = `${coreUrl}/api/patrikx3/git/notify-markdown-error`;
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            info: `
Repo: ${sanitize(currentRepo)}<br/>
Path: ${sanitize(currentRepoPath)}<br/>
Code: <br/>
<pre>${sanitize(code)}</pre><br/>
Language: ${sanitize(language)}<br/>
            `
        })
    }).then((response: any) => {
        if (response.status !== 200) {
            console.error('notifyMissingMarkdownCode invalid response', response);
        } else {
            console.info('notifyMissingMarkdownCode info response', response);
        }
    }).catch((e: any) => {
        console.error('notifyMissingMarkdownCode error', e);
    });
};

// Helper function to render images from tokens
const renderImages = (tokens: any[]): string => {
    return tokens.map((childToken: any) => {
        if (childToken.type === 'image') {
            const imgTitle = childToken.title ? ` title="${sanitize(childToken.title)}"` : '';
            const altText = sanitize(childToken.text);
            //console.log('childToken', childToken.href)
            if (childToken.href === 'https://snapcraft.io/static/images/badges/en/snap-store-black.svg') {
                childToken.href = 'https://cdn.corifeus.com/assets/svg/snap-store-black.svg'
            } 
            return `<img src="${sanitize(childToken.href)}" alt="${altText}"${imgTitle} crossOrigin="anonymous" />`;
        }
        // Handle other child token types if necessary
        return '';
    }).join('');
};


// Custom heading renderer
markdownRenderer.heading = (token: any): string => {
    const text: string = token.text;
    const level: number = token.depth;
    const raw: string = token.raw;

    const ref: string = kebabCase(htmlStrip(raw)).replace(/[^\x00-\xFF]/g, "");
    const id: string = `${ref}-parent`;
    let navClick: string = '';
    if (!IsBot()) {
        navClick = `onclick="return window.coryAppWebPagesNavigateHash('${sanitize(id)}');"`;
    }

    const element: string = `<h${level} id="${sanitize(id)}" class="cory-layout-markdown-header">${sanitize(text)}&nbsp;<a class="cory-layout-markdown-reference" id="${sanitize(ref)}" ${navClick} href="${sanitize(locationOrigin)}${sanitize(locationPathname)}#${sanitize(ref)}"><i class="fas fa-link"></i></a></h${level}>`;
    return element;
};

// Custom image renderer
markdownRenderer.image = (token: any): string => {
    let { href, title, text } = token;
    title = title || '';
    text = text || '';
    if (!href.startsWith('http')) {
        href = `https://cdn.corifeus.com/git/${sanitize(currentRepo)}/${sanitize(href)}`;
    }

    let result: string;
    if (text.toLowerCase().trim() === 'link') {
        result = `<img src="${sanitize(href)}" alt="LINK"/>`;
    } else {
        result = `
<span style="display: block; font-size: 125%; opacity: 0.5">
${sanitize(title)}
</span>
<a href="${sanitize(href)}" target="_blank"><img src="${sanitize(href)}" alt="${sanitize(text)}"/></a>
<span style="display: block; text-align: right; opacity: 0.5">
${sanitize(text)}
</span>
`;
    }

    return result;
};

// Custom link renderer
markdownRenderer.link = (token: any): string => {
    const title: any = token.title;
    let href: any = token.href;
    const text: any = token.text;

    let a: string;
    let tooltip: string = '';
    if (title !== null && title !== undefined) {
        tooltip = `tooltip="${sanitize(title)}"`;
    }
    let fixed: boolean = false;
    let path: any;

    const testHref: any = href.toLowerCase();

    const fixedUrl = (): void => {
        try {
            const url = new URL(href);
            href = url.pathname;
            path = `${href}`;
            fixed = true;
        } catch (error: any) {
            console.error('Invalid URL:', href, error);
        }
    };

    if (typeof testHref === 'string' && (testHref.startsWith('https://') || testHref.startsWith('http://'))) {
        try {
            const testUrl = new URL(testHref);
            for (let defaultDomain of settings.pages.defaultDomain) {
                if (testUrl.hostname === defaultDomain) {
                    fixedUrl();
                    break;
                }
            }
        } catch (error: any) {
            console.error('Invalid testHref URL:', testHref, error);
        }
    } else if (testHref.includes('localhost:8080')) {
        fixedUrl();
    }

    // Detect if the link contains image tokens
    const hasImage: boolean = token.tokens && token.tokens.some((childToken: any) => childToken.type === 'image');

    // Determine if the link is external
    const isExternal: boolean = (
        !href.startsWith(locationOrigin) &&
        (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:'))
    );

    if (isExternal) {
        if (href.endsWith('#cory-non-external')) {
            if (hasImage) {
                // Render image inside link without external link icon
                a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${sanitize(href)}">${renderImages(token.tokens)}</a></span>`;
            } else {
                a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${sanitize(href)}">${sanitize(text)}</a></span>`;
            }
        } else {
            if (hasImage) {
                // Render image inside link with external link icon
                a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${sanitize(href)}">${renderImages(token.tokens)}</a> <i class="fas fa-external-link-alt"></i></span>`;
            } else {
                a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${sanitize(href)}">${sanitize(text)}</a> <i class="fas fa-external-link-alt"></i></span>`;
            }
        }
    } else {
        if (!fixed) {
            if (href.endsWith('.md')) {
                href = href.substr(0, href.length - 3) + '.html';
            }
            if (href.startsWith(locationOrigin)) {
                path = `/${href.substring(locationOrigin.length + 1)}`;
            } else if (href.startsWith('./')) {
                let base = locationHref;
                if (!base.includes('.')) {
                    base = locationHref + '/';
                }
                try {
                    path = `${new URL(href, base).pathname}`;
                } catch (error: any) {
                    console.error('Invalid relative URL:', href, error);
                    path = href; // Fallback to original href
                }
            } else {
                path = `/${sanitize(currentRepo)}/${sanitize(href)}`;
            }
        }

        const navClick: string = !IsBot() ? `onclick="window.coryAppWebPagesNavigate('${sanitize(path)}'); return false;"` : '';
        if (hasImage) {
            // Render image inside link
            a = `<a class="cory-md-link" href="${sanitize(path)}" ${navClick} ${tooltip}>${renderImages(token.tokens)}</a>`;
        } else {
            // Render link with text
            a = `<a class="cory-md-link" href="${sanitize(path)}" ${navClick} ${tooltip}>${sanitize(text)}</a>`;
        }
    }
    return a;
};

// Custom code block renderer
markdownRenderer.code = (token: any): string => {

    // code, language
    const code: string = token.text;
    let language: any = token.lang;

    if (language === undefined) {
        language = 'text';
    }

    language = language.toLowerCase();

    if ((hljs.getLanguage(language) === 'undefined' || hljs.getLanguage(language) === undefined) && language !== 'text' && language !== 'txt') {
        console.error(`Please add highlight.js as a language (could be a marked error as well, sometimes it thinks a language): ${language}
We are not loading everything, since it is about 500kb`);
        notifyMissingMarkdownCode({
            code,
            language,
            currentRepo,
            currentRepoPath,
            coreUrl: settings.core.server.url
        });
    }
    // language = language === 'text' || language === 'txt' || language === undefined ? 'html' : language;
    const validLang: boolean = !!(language && hljs.getLanguage(language));
    const highlighted: string = validLang ? hljs.highlight(code, {
        language: language as string
    }).value : sanitize(code);

    codeIndex++;

    return `<div class="cory-markdown-code"><div class="cory-markdown-code-copy-paste" onclick="window.coryPageCopy(${codeIndex})"><i class="far fa-copy fa-lg"></i></div><pre><code style="font-family: 'Roboto Mono';" class="hljs ${sanitize(language)}" id="code-${codeIndex}">${highlighted}</code></pre></div>`;
};

// Custom inline code renderer
markdownRenderer.codespan = (token: any): string => {
    
    //console.warn('codespan', token)

    const code: string = token.text;
    const lang: string = 'html';
    const highlighted: string = hljs.highlight(code, {
        language: lang,
    }).value;
    return `<code style="display: inline; line-height: 34px;" class="hljs ${sanitize(lang)}">${highlighted}</code>`;
};

// Customize the rendering of tables
markdownRenderer.table = function (token: any): string {
    console.log('table', token)
    const header = token.header.map((cell: any) => this.tablecell(cell)).join('');
    const rows = token.rows
        .map((row: any[]) => this.tablerow({ text: row.map((cell: any) => this.tablecell(cell)).join('') }))
        .join('');

    return `<table class="corifeus-marked-table">
        <thead class="corifeus-marked-table-header">${header}</thead>
        <tbody class="corifeus-marked-table-body">${rows}</tbody>
    </table>`;
};

// Customize the rendering of table rows
markdownRenderer.tablerow = function (token: any): string {
    return `<tr class="corifeus-marked-table-row">${token.text}</tr>`;
};

// Customize the rendering of table cells
markdownRenderer.tablecell = function (token: any): string {
    const tag = token.header ? 'th' : 'td';
    const alignment = token.header ? ` style="text-align: ${token.header  ? 'center' : 'left'};"` : '';

    // Parse markdown content in cells
    const content = marked.parseInline(token.text);

    return `<${tag} class="corifeus-marked-table-cell"${alignment}>${content}</${tag}>`;
};

// Helper function to extract specific sections from Markdown
const extract = (template: any, area: any): string => {
    //   [//]: #@corifeus-header
    //   [//]: #corifeus-header:end
    //   [//]: #@corifeus-footer
    //   [//]: #@corifeus-footer:end
    const start: string = `[//]: #@${area}`;
    const end: string = `[//]: #@${area}:end`;

    const startIndex: number = template.indexOf(start);
    const endIndex: number = template.indexOf(end);

    // If start or end markers are not found, return the original template
    if (startIndex === -1 || endIndex === -1) {
        return template;
    }

    let result: string = template.substring(0, startIndex + start.length);
    result += template.substring(endIndex + end.length);
    return result;
};

// Helper function to escape regex special characters
const RegexpEscape = (s: string): string => {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};


// Construct function to process Markdown and convert to HTML
const construct = (data: any): string => {
    currentRepo = data.currentRepo;
    settings = data.settings;
    //console.log('data', data)   
    locationOrigin = data.location.origin;

    currentRepoPath = data.path;
    locationPathname = data.location.pathname;
    locationHref = data.location.href;
    locationHostname = data.location.hostname;
    let { md, packages, path } = data;
    md = md.trim();
    md = extract(md, 'corifeus-header');
    md = extract(md, 'corifeus-footer');

    /*
    md = twemoji.parse(md, {
      folder: 'svg',
      ext: '.svg',
    })
    */

    let html: string = marked(md, {
        renderer: markdownRenderer
    });    

    html = html.replace(/{/g, '&#123;<span style="display: none;"></span>').replace(/}/g, '&#125;');
    html = html.replace(/&amp;/g, '&');


    if (currentRepo === 'corifeus' && path === 'index.html') {
        //console.info('decorated corifeus index.html')
        for (let pkgName of Object.keys(packages)) {
            const pkg: any = packages[pkgName];
            //console.log(pkgName, pkg.corifeus.stargazers_count)
            //if (pkg.corifeus.stargazers_count > -1) {
                // Construct the hidden star placeholder dynamically
                const hiddenStars: string = `&lt;!--@star|${pkg.name}--&gt;`;
                let title: string = '';
    
                // Handle large star counts by adding a title
                if (pkg.corifeus.stargazers_count > 999) {
                    title = pkg.corifeus.stargazers_count.toString();
                }
    
                let stars: string = '';
                if (pkg.corifeus.stargazers_count > 0) {
                    // Construct the star count HTML element
                    stars = `<span style="opacity: 0.5; float: right; font-weight: normal;"> <i class="fas fa-star"></i> <span title="${sanitize(title)}">${extractStars(pkg.corifeus.stargazers_count)}</span></span>`;
                }

                // Escape the placeholder string so it can be safely used in the regex
                const re: RegExp = new RegExp(RegexpEscape(hiddenStars), 'g');

                // Perform the replacement
                html = html.replace(re, stars);
            //}
        }
    }
    
    return html;
};

// Web Worker message handling
onmessage = function (e: MessageEvent<any>): void {
    const data: any = {
        requestId: e.data.requestId
    }

   
    try {
        data.html = construct(e.data);
        data.success = true;
    } catch (error: any) {
        console.error(error);
        data.success = false;
        data.errorMessage = error.message;
    }
    postMessage(data);
}