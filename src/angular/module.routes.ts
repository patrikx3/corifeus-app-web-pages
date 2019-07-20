import {Routes} from '@angular/router';

export const moduleRoutes: Routes = [
    {
        path: 'github',
        loadChildren: () => import('./modules/github/github.module').then(m => m.GitHubModule)
    },
    {
        path: '',
//fixme AOT dynamic route
        redirectTo: `/github/corifeus`,
//        redirectTo: `/github/${settings.github.defaultRepo}`,
        pathMatch: 'full'
    },
    {
        path: ':repo',
        redirectTo: '/github/:repo'
    },
];
