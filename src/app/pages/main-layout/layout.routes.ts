import { Routes } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { PeoplePage } from './pages/people.page/people.page';
import { AboutPage } from './pages/about.page/about.page';
import { PeopleDetail } from './pages/people.page/components/people-detail/people-detail';

export const layout_routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      {
        path: 'people',
        component: PeoplePage,
      },
      {
        path: 'people/:id',
        component: PeopleDetail,
      },
      {
        path: 'about',
        component: AboutPage,
      },
      {
        path: '',
        redirectTo: 'people',
        pathMatch: 'full',
      },
    ],
  },
];
