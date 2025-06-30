import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;

  const mockDatabaseService = {
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('devrait créer un utilisateur avec mot de passe haché', async () => {
      const createUserDto = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        mdp: 'password123',
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        mdp: 'hashedPassword',
        created_at: new Date(),
      };

      mockDatabaseService.query.mockResolvedValue({ rows: [mockUser] });
      jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword' as never);

      const result = await service.create(createUserDto);

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'INSERT INTO Users (nom, prenom, email, mdp) VALUES ($1, $2, $3, $4) RETURNING *',
        ['Doe', 'John', 'john@example.com', 'hashedPassword'],
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('findByEmail', () => {
    it('devrait retourner un utilisateur quand trouvé', async () => {
      const mockUser = {
        id: 1,
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        mdp: 'hashedPassword',
        created_at: new Date(),
      };

      mockDatabaseService.query.mockResolvedValue({ rows: [mockUser] });

      const result = await service.findByEmail('john@example.com');

      expect(mockDatabaseService.query).toHaveBeenCalledWith(
        'SELECT * FROM Users WHERE email = $1',
        ['john@example.com'],
      );
      expect(result).toEqual(mockUser);
    });

    it('devrait retourner null quand utilisateur non trouvé', async () => {
      mockDatabaseService.query.mockResolvedValue({ rows: [] });

      const result = await service.findByEmail('inexistant@example.com');

      expect(result).toBeNull();
    });
  });

  describe('validatePassword', () => {
    it('devrait retourner true pour un mot de passe correct', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validatePassword(
        'password123',
        'hashedPassword',
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toBe(true);
    });

    it('devrait retourner false pour un mot de passe incorrect', async () => {
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validatePassword(
        'wrongPassword',
        'hashedPassword',
      );

      expect(result).toBe(false);
    });
  });
});
