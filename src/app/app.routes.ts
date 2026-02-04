import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PetFormComponent } from './components/pet-form/pet-form.component';
import { PetListComponent } from './components/pet-list/pet-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{
		path: 'pets',
		component: PetListComponent,
		canActivate: [authGuard],
		children: [
			{ path: 'create', component: PetFormComponent, canActivate: [authGuard] }
		]
	},
	{
		path: 'tutor',
		loadComponent: () => import('./components/tutor-list/tutor-list.component').then(m => m.TutorListComponent),
		canActivate: [authGuard],
		children: [
			{ path: 'create', loadComponent: () => import('./components/tutor-create/tutor-form.component').then(m => m.TutorFormComponent), canActivate: [authGuard] },
			{ path: ':id/link', loadComponent: () => import('./components/tutor-link/tutor-link.component').then(m => m.TutorLinkComponent), canActivate: [authGuard] }
		]
	},

	{ path: '', redirectTo: 'pets', pathMatch: 'full' },
];
