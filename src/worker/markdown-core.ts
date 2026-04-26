import { marked } from 'marked';

import kebabCase from 'lodash/kebabCase';
import { extractStars } from '../helper/extract-stars.function.js';
import IsBot from '../app/modules/web/util/is-bot.js';
import hljs from 'highlight.js/lib/core';

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
import htmlLang from 'highlight.js/lib/languages/xml';
import markdown from 'highlight.js/lib/languages/markdown';
import python from 'highlight.js/lib/languages/python';
import sql from 'highlight.js/lib/languages/sql';
import dockerfile from 'highlight.js/lib/languages/dockerfile';
import diff from 'highlight.js/lib/languages/diff';
import plaintext from 'highlight.js/lib/languages/plaintext';
import java from 'highlight.js/lib/languages/java';
import c from 'highlight.js/lib/languages/c';
import cpp from 'highlight.js/lib/languages/cpp';
import go from 'highlight.js/lib/languages/go';
import rust from 'highlight.js/lib/languages/rust';
import php from 'highlight.js/lib/languages/php';
import ruby from 'highlight.js/lib/languages/ruby';
import swift from 'highlight.js/lib/languages/swift';
import kotlin from 'highlight.js/lib/languages/kotlin';
import r from 'highlight.js/lib/languages/r';
import perl from 'highlight.js/lib/languages/perl';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import properties from 'highlight.js/lib/languages/properties';
import graphql from 'highlight.js/lib/languages/graphql';

hljs.registerLanguage('conf', nginx);
hljs.registerLanguage('xml', xml);
hljs.registerLanguage('html', htmlLang);
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
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('md', markdown);
hljs.registerLanguage('python', python);
hljs.registerLanguage('py', python);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('dockerfile', dockerfile);
hljs.registerLanguage('docker', dockerfile);
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('plaintext', plaintext);
hljs.registerLanguage('java', java);
hljs.registerLanguage('c', c);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('go', go);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('rs', rust);
hljs.registerLanguage('php', php);
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rb', ruby);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('kt', kotlin);
hljs.registerLanguage('r', r);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('properties', properties);
hljs.registerLanguage('graphql', graphql);

function htmlStrip(html: string): string {
    return html.replace(/<\/?[^>]+(>|$)/g, "");
}

const sanitize = (str: any): string => {
    if (typeof str !== 'string') return '';
    return str.replace(/&/g, '&amp;')
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;');
};

const RegexpEscape = (s: string): string => {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const extract = (template: any, area: any): string => {
    const start: string = `[//]: #@${area}`;
    const end: string = `[//]: #@${area}:end`;

    const startIndex: number = template.indexOf(start);
    const endIndex: number = template.indexOf(end);

    if (startIndex === -1 || endIndex === -1) {
        return template;
    }

    let result: string = template.substring(0, startIndex + start.length);
    result += template.substring(endIndex + end.length);
    return result;
};

interface RenderState {
    currentRepo: string;
    settings: any;
    currentRepoPath: string;
    locationOrigin: string;
    locationPathname: string;
    locationHref: string;
    locationHostname: string;
    codeIndex: number;
}

const renderImages = (tokens: any[]): string => {
    return tokens.map((childToken: any) => {
        if (childToken.type === 'image') {
            const imgTitle = childToken.title ? ` title="${sanitize(childToken.title)}"` : '';
            const altText = sanitize(childToken.text);
            if (childToken.href === 'https://snapcraft.io/static/images/badges/en/snap-store-black.svg') {
                childToken.href = 'https://cdn.corifeus.com/assets/svg/snap-store-black.svg'
            }
            return `<img src="${sanitize(childToken.href)}" alt="${altText}"${imgTitle} crossOrigin="anonymous" />`;
        }
        return '';
    }).join('');
};

function createRenderer(state: RenderState) {
    const renderer = new marked.Renderer();

    renderer.heading = (token: any): string => {
        const text: string = token.text;
        const level: number = token.depth;
        const raw: string = token.raw;

        const ref: string = kebabCase(htmlStrip(raw)).replace(/[^\x00-\xFF]/g, "");
        const id: string = `${ref}-parent`;
        let navClick: string = '';
        if (!IsBot()) {
            navClick = `onclick="return window.coryAppWebPagesNavigateHash('${sanitize(id)}');"`;
        }

        return `<h${level} id="${sanitize(id)}" class="cory-layout-markdown-header">${sanitize(text)}&nbsp;<a class="cory-layout-markdown-reference" id="${sanitize(ref)}" ${navClick} href="${sanitize(state.locationOrigin)}${sanitize(state.locationPathname)}#${sanitize(ref)}"><i class="fas fa-link"></i></a></h${level}>`;
    };

    renderer.image = (token: any): string => {
        let { href, title, text } = token;
        title = title || '';
        text = text || '';
        if (!href.startsWith('http')) {
            href = `https://cdn.corifeus.com/git/${sanitize(state.currentRepo)}/${sanitize(href)}`;
        }

        if (text.toLowerCase().trim() === 'link') {
            return `<img src="${sanitize(href)}" alt="LINK"/>`;
        }
        return `
<span style="display: block; font-size: 125%; opacity: 0.5">
${sanitize(title)}
</span>
<a href="${sanitize(href)}" target="_blank"><img src="${sanitize(href)}" alt="${sanitize(text)}"/></a>
<span style="display: block; text-align: right; opacity: 0.5">
${sanitize(text)}
</span>
`;
    };

    renderer.link = (token: any): string => {
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
                for (let defaultDomain of state.settings.pages.defaultDomain) {
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

        const hasImage: boolean = token.tokens && token.tokens.some((childToken: any) => childToken.type === 'image');

        const isExternal: boolean = (
            !href.startsWith(state.locationOrigin) &&
            (href.startsWith('https://') || href.startsWith('http://') || href.startsWith('mailto:'))
        );

        if (isExternal) {
            if (href.endsWith('#cory-non-external')) {
                if (hasImage) {
                    a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link-image" target="_blank" ${tooltip} href="${sanitize(href)}">${renderImages(token.tokens)}</a></span>`;
                } else {
                    a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${sanitize(href)}">${marked.parseInline(text)}</a></span>`;
                }
            } else {
                if (hasImage) {
                    a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link-image" target="_blank" ${tooltip} href="${sanitize(href)}">${renderImages(token.tokens)}</a></span>`;
                } else {
                    a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${sanitize(href)}">${marked.parseInline(text)}</a> <i class="fas fa-external-link-alt"></i></span>`;
                }
            }
        } else {
            if (!fixed) {
                if (href.endsWith('.md')) {
                    href = href.substr(0, href.length - 3) + '.html';
                }
                if (href.startsWith(state.locationOrigin)) {
                    path = `/${href.substring(state.locationOrigin.length + 1)}`;
                } else if (href.startsWith('./')) {
                    let base = state.locationHref;
                    if (!base.includes('.')) {
                        base = state.locationHref + '/';
                    }
                    try {
                        path = `${new URL(href, base).pathname}`;
                    } catch (error: any) {
                        console.error('Invalid relative URL:', href, error);
                        path = href;
                    }
                } else {
                    path = `/${sanitize(state.currentRepo)}/${sanitize(href)}`;
                }
            }

            const navClick: string = !IsBot() ? `onclick="window.coryAppWebPagesNavigate('${sanitize(path)}'); return false;"` : '';
            if (hasImage) {
                a = `<a class="cory-md-link" href="${sanitize(path)}" ${navClick} ${tooltip}>${renderImages(token.tokens)}</a>`;
            } else {
                a = `<a class="cory-md-link" href="${sanitize(path)}" ${navClick} ${tooltip}>${marked.parseInline(text)}</a>`;
            }
        }
        return a;
    };

    renderer.code = (token: any): string => {
        const code: string = token.text;
        let language: any = token.lang;

        if (!language) {
            language = 'text';
        }

        language = language.toLowerCase();

        if (hljs.getLanguage(language) === undefined && language !== 'text' && language !== 'txt') {
            console.warn(`Missing highlight.js language: ${language} | Repo: ${state.currentRepo} | Path: ${state.currentRepoPath}`);
        }
        const validLang: boolean = !!(language && hljs.getLanguage(language));
        const highlighted: string = validLang ? hljs.highlight(code, {
            language: language as string
        }).value : sanitize(code);

        state.codeIndex++;

        return `<div class="cory-markdown-code"><div class="cory-markdown-code-copy-paste" onclick="window.coryPageCopy(${state.codeIndex})"><i class="far fa-copy fa-lg"></i></div><pre><code style="font-family: 'Roboto Mono';" class="hljs ${sanitize(language)}" id="code-${state.codeIndex}">${highlighted}</code></pre></div>`;
    };

    renderer.codespan = (token: any): string => {
        const code: string = token.text;
        return `<code style="display: inline; line-height: 34px;" class="hljs">${sanitize(code)}</code>`;
    };

    renderer.table = function (token: any): string {
        const header = token.header.map((cell: any) => this.tablecell(cell)).join('');
        const rows = token.rows
            .map((row: any[]) => this.tablerow({ text: row.map((cell: any) => this.tablecell(cell)).join('') }))
            .join('');

        return `<table class="corifeus-marked-table">
            <thead class="corifeus-marked-table-header">${header}</thead>
            <tbody class="corifeus-marked-table-body">${rows}</tbody>
        </table>`;
    };

    renderer.tablerow = function (token: any): string {
        return `<tr class="corifeus-marked-table-row">${token.text}</tr>`;
    };

    renderer.tablecell = function (token: any): string {
        const tag = token.header ? 'th' : 'td';
        const alignment = token.header ? ` style="text-align: ${token.header  ? 'center' : 'left'};"` : '';

        const content = marked.parseInline(token.text);

        return `<${tag} class="corifeus-marked-table-cell"${alignment}>${content}</${tag}>`;
    };

    return renderer;
}

export function constructMarkdown(data: any): string {
    const state: RenderState = {
        currentRepo: data.currentRepo,
        settings: data.settings,
        currentRepoPath: data.path,
        locationOrigin: data.location.origin,
        locationPathname: data.location.pathname,
        locationHref: data.location.href,
        locationHostname: data.location.hostname,
        codeIndex: 0,
    };

    let { md, packages, path } = data;
    md = md.trim();
    md = extract(md, 'corifeus-header');

    const renderer = createRenderer(state);
    let html: string = marked(md, { renderer: renderer as any }) as string;

    html = html.replace(/{/g, '&#123;<span style="display: none;"></span>').replace(/}/g, '&#125;');
    html = html.replace(/&amp;/g, '&');

    if (state.currentRepo === 'corifeus' && path === 'index.html') {
        for (let pkgName of Object.keys(packages)) {
            const pkg: any = packages[pkgName];
            const hiddenStars: string = `&lt;!--@star|${pkg.name}--&gt;`;
            let title: string = '';

            if (pkg.corifeus.stargazers_count > 999) {
                title = pkg.corifeus.stargazers_count.toString();
            }

            let stars: string = '';
            if (pkg.corifeus.stargazers_count > 0) {
                stars = `<span style="opacity: 0.5; float: right; font-weight: normal;"> <i class="fas fa-star"></i> <span title="${sanitize(title)}">${extractStars(pkg.corifeus.stargazers_count)}</span></span>`;
            }

            const re: RegExp = new RegExp(RegexpEscape(hiddenStars), 'g');
            html = html.replace(re, stars);
        }
    }

    return html;
}
