import { Routes } from '@angular/router';
import { authMatchGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./components/login/login.component').then((m) => m.LoginComponent) },
	{
		path: 'pets',
		canMatch: [authMatchGuard],
		loadChildren: () => import('./features/pets/pets.routes').then((m) => m.PETS_ROUTES)
	},
	{
		path: 'tutor',
		canMatch: [authMatchGuard],
		loadChildren: () => import('./features/tutor/tutor.routes').then((m) => m.TUTOR_ROUTES)
	},

	{ path: '', redirectTo: 'pets', pathMatch: 'full' },
	{ path: '**', redirectTo: 'pets' }
];
