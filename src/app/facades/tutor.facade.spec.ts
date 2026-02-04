import { lastValueFrom, of } from 'rxjs';

import { TutorFacade } from './tutor.facade';
import { TutorService } from '../services/tutor.service';
import { TutorRequest } from '../models/tutor-request.model';
import { TutorResponse } from '../models/tutor-response.model';
import { ValidationError } from '../validators/validation-error';

describe('TutorFacade', () => {
  let tutorService: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    uploadPhoto: ReturnType<typeof vi.fn>;
    deletePhoto: ReturnType<typeof vi.fn>;
    linkPet: ReturnType<typeof vi.fn>;
    unlinkPet: ReturnType<typeof vi.fn>;
  };
  let facade: TutorFacade;

  beforeEach(() => {
    tutorService = {
      create: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
      uploadPhoto: vi.fn(),
      deletePhoto: vi.fn(),
      linkPet: vi.fn(),
      unlinkPet: vi.fn()
    };
    tutorService.create.mockReturnValue(of({ id: 1 } as TutorResponse));
    tutorService.update.mockReturnValue(of({ id: 1 } as TutorResponse));

    facade = new TutorFacade(tutorService as unknown as TutorService);
  });

  it('should reject create when nome is blank', async () => {
    const request: TutorRequest = { nome: '   ', telefone: '11999999999' };

    await expect(lastValueFrom(facade.create(request))).rejects.toBeInstanceOf(ValidationError);
    await expect(lastValueFrom(facade.create(request))).rejects.toThrow('Nome é obrigatório.');

    expect(tutorService.create).not.toHaveBeenCalled();
  });

  it('should reject create when telefone is blank', async () => {
    const request: TutorRequest = { nome: 'Maria', telefone: '   ' };

    await expect(lastValueFrom(facade.create(request))).rejects.toBeInstanceOf(ValidationError);
    await expect(lastValueFrom(facade.create(request))).rejects.toThrow('Telefone é obrigatório.');

    expect(tutorService.create).not.toHaveBeenCalled();
  });

  it('should reject create when cpf is present but invalid', async () => {
    const request: TutorRequest = { nome: 'Maria', telefone: '11999999999', cpf: '123.456.789-00' };

    await expect(lastValueFrom(facade.create(request))).rejects.toBeInstanceOf(ValidationError);
    await expect(lastValueFrom(facade.create(request))).rejects.toThrow('CPF inválido.');

    expect(tutorService.create).not.toHaveBeenCalled();
  });

  it('should sanitize and forward create to TutorService', async () => {
    const request: TutorRequest = {
      nome: '  João  ',
      telefone: '  11 99999-9999  ',
      email: '   ',
      endereco: '  Rua A  ',
      cpf: '529.982.247-25'
    };

    await lastValueFrom(facade.create(request));

    expect(tutorService.create).toHaveBeenCalledTimes(1);
    expect(tutorService.create.mock.calls[0][0]).toEqual({
      nome: 'João',
      telefone: '11 99999-9999',
      email: undefined,
      endereco: 'Rua A',
      cpf: '52998224725'
    });
  });

  it('should sanitize and forward update to TutorService', async () => {
    const request: TutorRequest = {
      nome: '  Ana  ',
      telefone: '  11900000000  ',
      cpf: undefined
    };

    await lastValueFrom(facade.update(10, request));

    expect(tutorService.update).toHaveBeenCalledTimes(1);
    expect(tutorService.update.mock.calls[0]).toEqual([10, { nome: 'Ana', telefone: '11900000000', email: undefined, endereco: undefined, cpf: undefined }]);
  });
});
