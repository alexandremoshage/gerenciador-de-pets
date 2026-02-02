import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';

import { AuthService } from '../auth.service';
import { PetService } from '../pet.service';
import { TutorService } from '../tutor.service';
import { authInterceptor } from '../../interceptors/auth.interceptor';
import { PetRequest } from '../../models/pet-request.model';
import { TutorRequest } from '../../models/tutor-request.model';

describe('Integração Real com a API', () => {
  let authService: AuthService;
  let petService: PetService;
  let tutorService: TutorService;

  let createdPetId: number;
  let createdTutorId: number;
  
  const TIMEOUT = 300000000;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        AuthService,
        PetService,
        TutorService
      ]
    });

    authService = TestBed.inject(AuthService);
    petService = TestBed.inject(PetService);
    tutorService = TestBed.inject(TutorService);
  });

  it('deve realizar login real e salvar o token', async () => {
    const credenciais = { username: 'admin', password: 'admin' };
    
    // Sem try/catch: se falhar, o teste quebra automaticamente mostrando o erro
    const response = await lastValueFrom(authService.login(credenciais));
    
    expect(response.access_token).toBeDefined();
    expect(localStorage.getItem('access_token')).toEqual(response.access_token);
  }, TIMEOUT);

  it('deve criar um Pet real na base de dados', async () => {
    const novoPet: PetRequest = {
      nome: 'Pet Teste Integração ' + new Date().getTime(),
      raca: 'Vira-lata Tech',
      idade: 5
    };

    const response = await lastValueFrom(petService.create(novoPet));
    createdPetId = response.id;

    expect(response.id).toBeGreaterThan(0);
    expect(response.nome).toBe(novoPet.nome);
  }, TIMEOUT);

  it('deve editar o Pet criado', async () => {
    expect(createdPetId).toBeDefined();

    const updateData: PetRequest = {
      nome: 'Pet Editado',
      raca: 'Raça Alterada',
      idade: 6
    };

    const response = await lastValueFrom(petService.update(createdPetId, updateData));
    expect(response.nome).toBe('Pet Editado');
    expect(response.idade).toBe(6);
  }, TIMEOUT);

  it('deve fazer upload de foto para o Pet', async () => {
    expect(createdPetId).toBeDefined();

    const blob = new Blob(['conteudo-imagem-falsa'], { type: 'image/png' });
    const file = new File([blob], 'teste.png', { type: 'image/png' });

    const response = await lastValueFrom(petService.uploadPhoto(createdPetId, file));
    expect(response.url).toBeDefined();
  }, TIMEOUT);

  it('deve criar um Tutor real', async () => {
    const novoTutor: TutorRequest = {
      nome: 'Tutor Teste ' + new Date().getTime(),
      email: 'teste@email.com',
      telefone: '65999999999',
      endereco: 'Rua dos Testes, 0',
      cpf: 12345678901
    };

    const response = await lastValueFrom(tutorService.create(novoTutor));
    createdTutorId = response.id;
    expect(response.id).toBeGreaterThan(0);
  }, TIMEOUT);

  it('deve vincular o Pet ao Tutor', async () => {
    expect(createdTutorId).toBeDefined();
    expect(createdPetId).toBeDefined();

    await lastValueFrom(tutorService.linkPet(createdTutorId, createdPetId));
    
    const tutorCompleto = await lastValueFrom(tutorService.findById(createdTutorId));
    const petVinculado = tutorCompleto.pets.find(p => p.id === createdPetId);
    
    expect(petVinculado).toBeDefined();
  }, TIMEOUT);

  it('deve desvincular o Pet do Tutor', async () => {
    await lastValueFrom(tutorService.unlinkPet(createdTutorId, createdPetId));
    
    const tutorCompleto = await lastValueFrom(tutorService.findById(createdTutorId));
    const petVinculado = tutorCompleto.pets?.find(p => p.id === createdPetId);
    
    expect(petVinculado).toBeUndefined();
  }, TIMEOUT);

  it('deve deletar o Pet e o Tutor para limpar a base', async () => {
    if (createdPetId) {
      await lastValueFrom(petService.delete(createdPetId));
    }
    if (createdTutorId) {
      await lastValueFrom(tutorService.delete(createdTutorId));
    }
  }, TIMEOUT);
});