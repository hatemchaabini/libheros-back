import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('devrait appeler authService.register et retourner le résultat', async () => {
      const createUserDto = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        mdp: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt_token',
        user: {
          id: 1,
          nom: 'Doe',
          prenom: 'John',
          email: 'john@example.com',
        },
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('devrait propager les erreurs du service', async () => {
      const createUserDto = {
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
        mdp: 'password123',
      };

      mockAuthService.register.mockRejectedValue(
        new UnauthorizedException('Email déjà utilisé'),
      );

      await expect(controller.register(createUserDto)).rejects.toThrow(
        new UnauthorizedException('Email déjà utilisé'),
      );
    });
  });

  describe('login', () => {
    it('devrait appeler authService.login et retourner le résultat', async () => {
      const loginDto = {
        email: 'john@example.com',
        mdp: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt_token',
        user: {
          id: 1,
          nom: 'Doe',
          prenom: 'John',
          email: 'john@example.com',
        },
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getProfile', () => {
    it('devrait retourner les infos utilisateur depuis la request', async () => {
      const mockRequest = {
        user: {
          id: 1,
          nom: 'Doe',
          prenom: 'John',
          email: 'john@example.com',
        },
      };

      const result = await controller.getProfile(mockRequest as any);

      expect(result).toEqual({
        id: 1,
        nom: 'Doe',
        prenom: 'John',
        email: 'john@example.com',
      });
    });
  });
});
