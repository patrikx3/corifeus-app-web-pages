import {Routes} from '@angular/router';

import {Layout} from './layout';
import {Page} from './page/cory-page';
//import {OpenCollective} from './page/cory-open-collective';

import {Http404} from '../material';


export const githubRoutes: Routes = [

    {
        path: '',
        component: Layout,
        children: [
            {
                path: '404',
                component: Http404
            },
            /*
            {
                path: 'open-collective',
                component: OpenCollective
            },
             */
            {
                path: '**',
                component: Page
            }
        ]

    },

];
