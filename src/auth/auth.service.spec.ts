// Unit tests for AuthService with JWT authentication
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('devrait créer un utilisateur et retourner un token', async () => {
      const createUserDto = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        mdp: 'password123',
      };

      const mockUser = {
        id: 1,
        ...createUserDto,
        created_at: new Date(),
      };

      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.register(createUserDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockUsersService.create).toHaveBeenCalledWith(createUserDto);
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'john@example.com',
      });
      expect(result).toEqual({
        access_token: 'jwt_token',
        user: {
          id: 1,
          nom: 'Doe',
          prenom: 'John',
          email: 'john@example.com',
        },
      });
    });

    it('devrait lever une erreur si email déjà utilisé', async () => {
      const createUserDto = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        mdp: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue({ id: 1 });

      await expect(service.register(createUserDto)).rejects.toThrow(
        new UnauthorizedException('Email déjà utilisé'),
      );
    });
  });

  describe('login', () => {
    it('devrait retourner un token pour des credentials valides', async () => {
      const loginDto = {
        email: 'john@example.com',
        mdp: 'password123',
      };

      const mockUser = {
        id: 1,
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        mdp: 'hashedPassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt_token');

      const result = await service.login(loginDto);

      expect(mockUsersService.findByEmail).toHaveBeenCalledWith(
        'john@example.com',
      );
      expect(mockUsersService.validatePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword',
      );
      expect(result).toEqual({
        access_token: 'jwt_token',
        user: {
          id: 1,
          nom: 'Doe',
          prenom: 'John',
          email: 'john@example.com',
        },
      });
    });

    it('devrait lever une erreur pour email inexistant', async () => {
      const loginDto = {
        email: 'inexistant@example.com',
        mdp: 'password123',
      };

      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou mot de passe incorrect'),
      );
    });

    it('devrait lever une erreur pour mot de passe incorrect', async () => {
      const loginDto = {
        email: 'john@example.com',
        mdp: 'wrongPassword',
      };

      const mockUser = {
        id: 1,
        email: 'john@example.com',
        mdp: 'hashedPassword',
      };

      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Email ou mot de passe incorrect'),
      );
    });
  });
});
