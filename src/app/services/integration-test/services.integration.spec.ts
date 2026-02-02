import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';
import { PetService } from '../pet.service';
import { TutorService } from '../tutor.service';
import { authInterceptor } from '../../interceptors/auth.interceptor';
import { PetRequest } from '../../models/pet-request.model';
import { TutorRequest } from '../../models/tutor-request.model';

describe('Integração Real com a API (Setup no beforeAll)', () => {
  let authService: AuthService;
  let petService: PetService;
  let tutorService: TutorService;

  let createdPetId: number;
  let createdTutorId: number;

  const TIMEOUT = 300000000;

  beforeAll(async () => {
    TestBed.configureTestingModule({
      teardown: { destroyAfterEach: false },
      providers: [provideHttpClient(withFetch(), withInterceptors([authInterceptor])), AuthService, PetService, TutorService],
    });

    authService = TestBed.inject(AuthService);
    petService = TestBed.inject(PetService);
    tutorService = TestBed.inject(TutorService);

    const credenciais = { username: 'admin', password: 'admin' };
    const loginResponse = await lastValueFrom(authService.login(credenciais));

    expect(loginResponse.access_token).toBeDefined();
    expect(localStorage.getItem('access_token')).toEqual(loginResponse.access_token);

    const novoPet: PetRequest = {
      nome: 'Pet Setup Integração ' + Date.now(),
      raca: 'Vira-lata Tech',
      idade: 5,
    };

    const petResponse = await lastValueFrom(petService.create(novoPet));
    createdPetId = petResponse.id;

    expect(createdPetId).toBeGreaterThan(0);

    const unique = Date.now();
    const novoTutor: TutorRequest = {
      nome: 'Tutor Setup ' + unique,
      email: `teste+${unique}@email.com`,
      telefone: '65999999999',
      endereco: 'Rua dos Testes, 0',
      cpf: Number(String(unique).slice(-11).padStart(11, '1')),
    };

    const tutorResponse = await lastValueFrom(tutorService.create(novoTutor));
    createdTutorId = tutorResponse.id;

    expect(createdTutorId).toBeGreaterThan(0);
  }, TIMEOUT);

  it(
    'deve editar o Pet criado no setup',
    async () => {
      expect(createdPetId).toBeDefined();

      const updateData: PetRequest = {
        nome: 'Pet Editado',
        raca: 'Raça Alterada',
        idade: 6,
      };

      const response = await lastValueFrom(petService.update(createdPetId, updateData));
      expect(response.nome).toBe('Pet Editado');
      expect(response.idade).toBe(6);
    },
    TIMEOUT,
  );
 

  it(
    'deve vincular o Pet ao Tutor',
    async () => {
      expect(createdTutorId).toBeDefined();
      expect(createdPetId).toBeDefined();

      await lastValueFrom(tutorService.linkPet(createdTutorId, createdPetId));

      const tutorCompleto = await lastValueFrom(tutorService.findById(createdTutorId));
      const petVinculado = tutorCompleto.pets?.find((p) => p.id === createdPetId);

      expect(petVinculado).toBeDefined();
    },
    TIMEOUT,
  );

  it(
    'deve desvincular o Pet do Tutor',
    async () => {
      expect(createdTutorId).toBeDefined();
      expect(createdPetId).toBeDefined();

      await lastValueFrom(tutorService.unlinkPet(createdTutorId, createdPetId));

      const tutorCompleto = await lastValueFrom(tutorService.findById(createdTutorId));
      const petVinculado = tutorCompleto.pets?.find((p) => p.id === createdPetId);

      expect(petVinculado).toBeUndefined();
    },
    TIMEOUT,
  );
});
