import { Routes } from '@angular/router';

import { Layout } from '../layout';
import { Page } from '../modules/cory-page';
import { OpenCollective } from '../modules/cory-open-collective';

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
                path: 'open-collective',
                component: OpenCollective
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