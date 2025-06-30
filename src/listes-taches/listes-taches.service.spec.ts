import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ListesTachesService } from './listes-taches.service';
import { DatabaseService } from '../database.service';

describe('ListesTachesService', () => {
  let service: ListesTachesService;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListesTachesService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<ListesTachesService>(ListesTachesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer une liste de tâches', async () => {
      const createDto = { nom: 'Ma liste' };
      const utilisateurId = 1;
      const mockListe = {
        id: 1,
        nom: 'Ma liste',
        utilisateur_id: 1,
        cree_le: new Date(),
        modifie_le: new Date(),
      };

      mockDatabaseService.query.mockResolvedValue({ rows: [mockListe] });

      const result = await service.create(createDto, utilisateurId);

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'INSERT INTO listes_taches (nom, utilisateur_id) VALUES ($1, $2) RETURNING *',
        ['Ma liste', 1],
      );
      expect(result).toEqual(mockListe);
    });
  });

  describe('findAllByUser', () => {
    it('devrait retourner toutes les listes d un utilisateur', async () => {
      const utilisateurId = 1;
      const mockListes = [
        { id: 1, nom: 'Liste 1', utilisateur_id: 1 },
        { id: 2, nom: 'Liste 2', utilisateur_id: 1 },
      ];

      mockDatabaseService.query.mockResolvedValue({ rows: mockListes });

      const result = await service.findAllByUser(utilisateurId);

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM listes_taches WHERE utilisateur_id = $1 ORDER BY cree_le DESC',
        [1],
      );
      expect(result).toEqual(mockListes);
    });
  });

  describe('findOne', () => {
    it('devrait retourner une liste si elle appartient à l utilisateur', async () => {
      const mockListe = {
        id: 1,
        nom: 'Ma liste',
        utilisateur_id: 1,
        cree_le: new Date(),
        modifie_le: new Date(),
      };

      mockDatabaseService.query.mockResolvedValue({ rows: [mockListe] });

      const result = await service.findOne(1, 1);

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM listes_taches WHERE id = $1 AND utilisateur_id = $2',
        [1, 1],
      );
      expect(result).toEqual(mockListe);
    });

    it('devrait lever une erreur si liste non trouvée', async () => {
      mockDatabaseService.query.mockResolvedValue({ rows: [] });

      await expect(service.findOne(999, 1)).rejects.toThrow(
        new NotFoundException('Liste de tâches non trouvée'),
      );
    });
  });

  describe('update', () => {
    it('devrait mettre à jour une liste existante', async () => {
      const updateDto = { nom: 'Nouveau nom' };
      const mockListeExistante = {
        id: 1,
        nom: 'Ancien nom',
        utilisateur_id: 1,
      };
      const mockListeMiseAJour = {
        id: 1,
        nom: 'Nouveau nom',
        utilisateur_id: 1,
        modifie_le: new Date(),
      };

      mockDatabaseService.query
        .mockResolvedValueOnce({ rows: [mockListeExistante] }) // findOne
        .mockResolvedValueOnce({ rows: [mockListeMiseAJour] }); // update

      const result = await service.update(1, updateDto, 1);

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'UPDATE listes_taches SET nom = $1, modifie_le = CURRENT_TIMESTAMP WHERE id = $2 AND utilisateur_id = $3 RETURNING *',
        ['Nouveau nom', 1, 1],
      );
      expect(result).toEqual(mockListeMiseAJour);
    });
  });

  describe('remove', () => {
    it('devrait supprimer une liste existante', async () => {
      const mockListe = {
        id: 1,
        nom: 'Ma liste',
        utilisateur_id: 1,
      };

      mockDatabaseService.query
        .mockResolvedValueOnce({ rows: [mockListe] }) // findOne
        .mockResolvedValueOnce({ rows: [] }); // delete

      await service.remove(1, 1);

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'DELETE FROM listes_taches WHERE id = $1 AND utilisateur_id = $2',
        [1, 1],
      );
    });
  });
});
