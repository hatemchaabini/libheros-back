import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TachesService } from './taches.service';
import { DatabaseService } from '../database.service';
import { ListesTachesService } from '../listes-taches/listes-taches.service';

describe('TachesService', () => {
  let service: TachesService;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  const mockListesTachesService = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TachesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
        {
          provide: ListesTachesService,
          useValue: mockListesTachesService,
        },
      ],
    }).compile();

    service = module.get<TachesService>(TachesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer une tâche', async () => {
      const createDto = {
        description_courte: 'Acheter du pain',
        description_longue: 'Aller à la boulangerie',
        date_echeance: '2025-01-03',
      };
      const listeId = 1;
      const utilisateurId = 1;

      const mockListe = { id: 1, utilisateur_id: 1 };
      const mockTache = {
        id: 1,
        liste_id: 1,
        description_courte: 'Acheter du pain',
        description_longue: 'Aller à la boulangerie',
        date_echeance: '2025-01-03',
        est_terminee: false,
      };

      mockListesTachesService.findOne.mockResolvedValue(mockListe);
      mockDatabaseService.query.mockResolvedValue({ rows: [mockTache] });

      const result = await service.create(listeId, createDto, utilisateurId);

      expect(mockListesTachesService.findOne).toHaveBeenCalledWith(1, 1);
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'INSERT INTO taches (liste_id, description_courte, description_longue, date_echeance) VALUES ($1, $2, $3, $4) RETURNING *',
        [1, 'Acheter du pain', 'Aller à la boulangerie', '2025-01-03'],
      );
      expect(result).toEqual(mockTache);
    });
  });

  describe('toggleTerminee', () => {
    it('devrait basculer l état terminé d une tâche', async () => {
      const tacheId = 1;
      const utilisateurId = 1;

      const mockTache = {
        id: 1,
        est_terminee: false,
        liste_id: 1,
      };

      const mockTacheMiseAJour = {
        id: 1,
        est_terminee: true,
        liste_id: 1,
      };

      mockDatabaseService.query
        .mockResolvedValueOnce({ rows: [mockTache] }) // findOne
        .mockResolvedValueOnce({ rows: [mockTacheMiseAJour] }); // toggle

      const result = await service.toggleTerminee(tacheId, utilisateurId);

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'UPDATE taches SET est_terminee = NOT est_terminee, modifie_le = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
        [1],
      );
      expect(result).toEqual(mockTacheMiseAJour);
    });
  });

  describe('findOne', () => {
    it('devrait retourner une tâche si elle appartient à l utilisateur', async () => {
      const mockTache = {
        id: 1,
        description_courte: 'Ma tâche',
        liste_id: 1,
      };

      mockDatabaseService.query.mockResolvedValue({ rows: [mockTache] });

      const result = await service.findOne(1, 1);

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT t.* FROM taches t'),
        [1, 1],
      );
      expect(result).toEqual(mockTache);
    });

    it('devrait lever une erreur si tâche non trouvée', async () => {
      mockDatabaseService.query.mockResolvedValue({ rows: [] });

      await expect(service.findOne(999, 1)).rejects.toThrow(
        new NotFoundException('Tâche non trouvée'),
      );
    });
  });
});
