import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { PetCreateComponent } from './components/pet-create/pet-create.component';
import { PetListComponent } from './pet-list/pet-list.component';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'pets/create', component: PetCreateComponent },
	{ path: 'pets', component: PetListComponent },
];
