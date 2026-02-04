import { lastValueFrom, of } from 'rxjs';

import { PetFacade } from './pet.facade';
import { PetService } from '../services/pet.service';
import { PetRequest } from '../models/pet-request.model';
import { PetResponse } from '../models/pet-response.model';
import { ValidationError } from '../validators/validation-error';

describe('PetFacade', () => {
  let petService: {
    create: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    findAll: ReturnType<typeof vi.fn>;
    findById: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    uploadPhoto: ReturnType<typeof vi.fn>;
    deletePhoto: ReturnType<typeof vi.fn>;
  };
  let facade: PetFacade;

  beforeEach(() => {
    petService = {
      create: vi.fn(),
      update: vi.fn(),
      findAll: vi.fn(),
      findById: vi.fn(),
      delete: vi.fn(),
      uploadPhoto: vi.fn(),
      deletePhoto: vi.fn()
    };
    petService.create.mockReturnValue(of({ id: 1 } as PetResponse));
    petService.update.mockReturnValue(of({ id: 1 } as PetResponse));

    facade = new PetFacade(petService as unknown as PetService);
  });

  it('should reject create when nome is blank', async () => {
    const request: PetRequest = { nome: '   ' };

    await expect(lastValueFrom(facade.create(request))).rejects.toBeInstanceOf(ValidationError);
    await expect(lastValueFrom(facade.create(request))).rejects.toThrow('Nome do pet é obrigatório.');

    expect(petService.create).not.toHaveBeenCalled();
  });

  it('should sanitize and forward create to PetService', async () => {
    const request: PetRequest = { nome: '  Rex  ', raca: '   ', idade: 3 };

    await lastValueFrom(facade.create(request));

    expect(petService.create).toHaveBeenCalledTimes(1);
    expect(petService.create.mock.calls[0][0]).toEqual({
      nome: 'Rex',
      raca: undefined,
      idade: 3
    });
  });

  it('should sanitize and forward update to PetService', async () => {
    const request: PetRequest = { nome: '  Nina  ', raca: '  Vira-lata  ', idade: undefined };

    await lastValueFrom(facade.update(99, request));

    expect(petService.update).toHaveBeenCalledTimes(1);
    expect(petService.update.mock.calls[0]).toEqual([99, { nome: 'Nina', raca: 'Vira-lata', idade: undefined }]);
  });
});
