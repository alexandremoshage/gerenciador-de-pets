import { Routes } from '@angular/router';

export const PETS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('../../components/pet-list/pet-list.component').then((m) => m.PetListComponent)
  },
  {
    path: 'create',
    loadComponent: () => import('../../components/pet-list/pet-list.component').then((m) => m.PetListComponent)
  },
  {
    path: ':id/details',
    loadComponent: () => import('../../components/pet-list/pet-list.component').then((m) => m.PetListComponent)
  }
];
