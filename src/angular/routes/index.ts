import { Routes } from '@angular/router';

import { Layout } from '../layout';
import { Page } from '../modules/cory-page';

import { Http404 } from 'corifeus-web-material';


export const routes: Routes = [

    {
        path: 'github/:repo',
        component: Layout,
        children: [
            {
                path: '404',
                component: Http404
            },
            {
                path: '**',
                component: Page
            }
        ]

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