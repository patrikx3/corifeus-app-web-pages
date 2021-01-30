/// <reference lib="webworker" />

import kebabCase from 'lodash/kebabCase';

const  { extractStars} = require('../helper/extract-stars.function.js');


let currentRepo, settings, currentRepoPath
let  locationOrigin, locationPathname, locationHref, locationHostname

function htmlStrip(html) {
//    const tmp = document.createElement("DIV");
//    tmp.innerHTML = html;
//    return tmp.textContent || tmp.innerText || "";
  return html.replace(/<\/?[^>]+(>|$)/g, "");
}

const notifyMissingMarkdownCode = ({ code, language, currentRepo, currentRepoPath, coreUrl}) => {
  const url = `${coreUrl}/api/patrikx3/git/notify-markdown-error`
  fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
//        mode: 'cors', // no-cors, *cors, same-origin
//        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
//        credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
//        redirect: 'follow', // manual, *follow, error
//        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify({
      info: `
Repo: ${currentRepo}<br/>
Path: ${currentRepoPath}<br/>
Code: <br/>
<pre>${code}</pre><br/>
Language: ${language}<br/>
`
    }) // body data type must match "Content-Type" header
  }).then(response => {
    if (response.status !== 200) {
      console.error('notifyMissingMarkdownCode invalid response', response)
    } else {
        console.info('notifyMissingMarkdownCode info response', response)
    }
  }).catch(e => {
      console.error('notifyMissingMarkdownCode error', e)
  })
}

const IsBot = require('../app/modules/web/util/is-bot.js')

const hljs = require('highlight.js/lib/core');

// this is for HTML as well
hljs.registerLanguage('conf', require('highlight.js/lib/languages/nginx.js'));

hljs.registerLanguage('xml', require('highlight.js/lib/languages/xml.js'));

hljs.registerLanguage('css', require('highlight.js/lib/languages/css.js'));

hljs.registerLanguage('scss', require('highlight.js/lib/languages/scss.js'));

hljs.registerLanguage('yaml', require('highlight.js/lib/languages/yaml.js'));
hljs.registerLanguage('yml', require('highlight.js/lib/languages/yaml.js'));

hljs.registerLanguage('powershell', require('highlight.js/lib/languages/powershell.js'));

hljs.registerLanguage('javascript', require('highlight.js/lib/languages/javascript.js'));
hljs.registerLanguage('js', require('highlight.js/lib/languages/javascript.js'));

hljs.registerLanguage('json', require('highlight.js/lib/languages/json.js'));

hljs.registerLanguage('bash', require('highlight.js/lib/languages/shell.js'));
hljs.registerLanguage('sh', require('highlight.js/lib/languages/shell.js'));

hljs.registerLanguage('typescript', require('highlight.js/lib/languages/typescript.js'));
hljs.registerLanguage('ts', require('highlight.js/lib/languages/typescript.js'));

hljs.registerLanguage('ini', require('highlight.js/lib/languages/ini.js'));


/*
import { environment } from '../environments/environment';
const twemoji = require('twemoji').default;
if (environment.production) {
  twemoji.base = '/assets/twemoji/';
}
 */

const marked = require('marked')

const markdownRenderer = new marked.Renderer();


const extract = (template, area) => {
  //   [//]: #@corifeus-header
  //   [//]: #corifeus-header:end
  //   [//]: #@corifeus-footer
  //   [//]: #@corifeus-footer:end
  const start = `[//]: #@${area}`;
  const end = `[//]: #@${area}:end`;

  const startIndex = template.indexOf(start);
  const endIndex = template.indexOf(end);

  //console.log('start', start, startIndex)
  //console.log('end', end, endIndex)


  let result = template.substring(0, startIndex + start.length);
  result += template.substring(endIndex + end.length);
  return result;
}


markdownRenderer.heading = (text, level, raw) => {
//            console.log('text', text,)
//            console.log('raw', raw)
  const ref = kebabCase(htmlStrip(raw)).replace(/[^\x00-\xFF]/g, "");
//            console.log('ref', ref)
  const id = `${ref}-parent`;
//console.log(ref);
  let navClick = ''
  if (!IsBot()) {
    navClick = `onclick="return window.coryAppWebPagesNavigateHash('${id}');"`;
  }

  let element = `<h${level} id="${id}" class="cory-layout-markdown-header">${text}&nbsp;<a class="cory-layout-markdown-reference" id="${ref}" ${navClick} href="${locationOrigin}${locationPathname}#${ref}"><i class="fas fa-link"></i></a></h${level}>`;

//            console.log('ref', ref)
  return element
}

markdownRenderer.image = (href, title, text) => {
  title = title || '';
  text = text || '';
  if (!href.startsWith('http')) {
    href = `https://cdn.corifeus.com/git/${currentRepo}/${href}`;
  }

  let result
  if (text.toLowerCase().trim() === 'link') {
    result = `<img src="${href}"/>`;

  } else {
    result = `
<span style="display: block; font-size: 125%; opacity: 0.5">
${title}
</span>
<a href="${href}" target="_blank"><img src="${href}"/></a>
<span style="display: block; text-align: right; opacity: 0.5">
${text}
</span>
`;

  }

  return result;
};

markdownRenderer.link = (href, title, text) => {

  let a;
  let tooltip = '';
  if (title !== null && title !== undefined) {
    tooltip = `tooltip="${title}"`;
  }
  let fixed = false;
  let path;

  const testHref = href.toLowerCase();

  const fixedUrl = () => {
    const url = new URL(href);
    href = url.pathname;
    path = `${href}`;
    fixed = true;
//console.log('fixed')
  }

  if ((typeof testHref === 'string' && (testHref.startsWith('https://') || testHref.startsWith('http://'))) ) {
    const testUrl = new URL(testHref)
    for(let defaultDomain of settings.pages.defaultDomain) {
      if (testUrl.hostname === defaultDomain) {
        fixedUrl();
        break;
      }
    }
  } else if (testHref.includes('localhost:8080')) {
    fixedUrl()
  }

//            console.log('href', href)
  if (!href.startsWith(locationOrigin) && (href.startsWith('https:/') || href.startsWith('http:/') || href.startsWith('mailto:'))) {

    /*
    if (href.startsWith('mailto:')) {
        console.log(href)
    }
     */

    if (href.endsWith('#cory-non-external')) {
      a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${href}">${text}</a>`;
    } else {
      a = `<span class="cory-layout-link-external"><a color="accent" class="cory-md-link" target="_blank" ${tooltip} href="${href}">${text}</a> <i class="fas fa-external-link-alt"></i></span>`;
    }

  } else {
    if (!fixed) {
      if (href.endsWith('.md')) {
        href = href.substr(0, href.length - 3) + '.html';
      }
      if (href.startsWith(locationOrigin)) {
        path = `/${href.substring(locationOrigin.length + 1)}`;
      } else if (href.startsWith('./')) {
        let base = locationHref
        if (!base.includes('.')) {
          base = locationHref + '/';
        }
        path = `${new URL(href, base).pathname}`;
//                        console.log(path)
      } else {
        path = `/${currentRepo}/${href}`;
      }
    }

//                console.log(path)
    // this.context.parent.navigate

    const navClick = !IsBot() ? `onclick="window.coryAppWebPagesNavigate('${path}'); return false;"` : '';
    a = `<a class="cory-md-link" href="${path}" ${navClick} ${tooltip}>${text}</a>`;
//                console.log(path);
//                console.log(a);
  }
  return a;
}

markdownRenderer.code = (code, language) => {
  if (language === undefined) {
    language = 'text';
  }

  language = language.toLowerCase()

//    console.log('TEST', language, currentRepo, currentRepoPath, settings.core.server)

  if ((hljs.getLanguage(language) === 'undefined' || hljs.getLanguage(language) === undefined) && language !== 'text' && language !== 'txt') {
    console.error(`Please add highlight.js as a language (could be a marked error as well, sometimes it thinks a language): ${language}
We are not loading everything, since it is about 500kb`)
    notifyMissingMarkdownCode({
      code,
      language,
      currentRepo, currentRepoPath,
      coreUrl: settings.core.server.url
    })
  }
//  language = language === 'text' || language === 'txt' || language === undefined ? 'html' : language;
  const validLang = !!(language && hljs.getLanguage(language));
  const highlighted = validLang ? hljs.highlight(language, code).value : code;
  return `<pre><code style="font-family: 'Roboto Mono';" class="hljs ${language}">${highlighted}</code></pre>`;
};

markdownRenderer.codespan = (code) => {
  const lang = 'html';
  const highlighted = hljs.highlight(lang, code).value;
  return `<code style="display: inline; line-height: 34px;" class="hljs ${lang}">${highlighted}</code>`;
}

const construct = (data) => {
  currentRepo = data.currentRepo
  settings  = data.settings
  locationOrigin = location.origin

  currentRepoPath = data.path
  locationPathname = location.pathname
  locationHref = location.href
  locationHostname = location.hostname
  let { md, packages, path } = data
  md = md.trim()
  md = extract(md, 'corifeus-header');
  md = extract(md, 'corifeus-footer');

  /*
  md = twemoji.parse(md, {
    folder: 'svg',
    ext: '.svg',
  })
  */


  let html = marked(md, {
    renderer: markdownRenderer
  });

  html = html.replace(/{/g, '&#123;<span style="display: none;"></span>').replace(/}/g, '&#125;');
  html = html.replace(/&amp;/g, '&');


  if (currentRepo === 'corifeus' && path === 'index.html') {
    //console.info('decorated corifeus index.html')
    for(let pkgName of Object.keys(packages)) {
      const pkg = packages[pkgName]
      if (pkg.corifeus.stargazers_count > 0) {
        const hiddenStars = `<!--@star|${pkg.name}-->`;
        const stars = `<span style="opacity: 0.5; float: right; font-weight: normal;"> <i class="fas fa-star"></i> ${extractStars(pkg.corifeus.stargazers_count)}</span>`
        const re = new RegExp(RegexpEscape(hiddenStars));
        html = html.replace(re, stars)
      }
    }
  } else {
    //console.info('not decorated', currentRepo, path)
  }

  return html;

}

const RegexpEscape = function (s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

onmessage = function (e) {
  const data : any = {
    requestId: e.data.requestId
  }
  try {
    data.html = construct(e.data);
    data.success = true
  } catch (e) {
    console.error(e)
    data.success = false
    data.errorMessage = e.message
  }
  postMessage(data)

}

