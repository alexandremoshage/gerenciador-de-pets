import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PetFormComponent } from './components/pet-create/pet-form.component';
import { PetListComponent } from './components/pet-list/pet-list.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'pets/create', component: PetFormComponent, canActivate: [authGuard] },
	{ path: 'pets', component: PetListComponent, canActivate: [authGuard] },
];
