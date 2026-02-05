import { Routes } from '@angular/router';

export const TUTOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../components/tutor-list/tutor-list.component').then((m) => m.TutorListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('../../components/tutor-list/tutor-list.component').then((m) => m.TutorListComponent)
  },
  {
    path: ':id/link',
    loadComponent: () => import('../../components/tutor-list/tutor-list.component').then((m) => m.TutorListComponent)
  }
];
