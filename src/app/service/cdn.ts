import {Injectable} from '@angular/core';

@Injectable()
export class CdnService {

    url(repo: string, path: string): string {
        const postfix = '.html';

        //FIXME corifeus - matrix
        if (repo === 'matrix') {
            repo = 'corifeus';
        }

        const index = `index${postfix}`;
        if (path.endsWith(index)) {
            path = path.substring(0, path.length - index.length) + 'README.md';
        } else if (path.endsWith(postfix)) {
            path = path.substring(0, path.length - postfix.length) + '.md';
        }

        return `https://cdn.corifeus.com/git/${repo}/${path}`;
    }
}
