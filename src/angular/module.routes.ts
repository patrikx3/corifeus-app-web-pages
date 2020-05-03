import {Routes} from '@angular/router';

export const moduleRoutes: Routes = [
    {
        path: ':repo',
        loadChildren: () => import('./modules/github/github.module').then(m => m.GitHubModule)
    },
    {
        path: '',
        redirectTo: `/matrix`,
//        redirectTo: `/github/${settings.github.defaultRepo}`,
        pathMatch: 'full'
    },
];
