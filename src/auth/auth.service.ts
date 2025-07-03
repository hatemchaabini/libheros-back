// JWT Authentication service for LibHeros backend
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService, CreateUserDto } from '../users/users.service';

export interface LoginDto {
  email: string;
  mdp: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: number;
    nom: string;
    prenom: string;
    email: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AuthResponse> {
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new UnauthorizedException('Email déjà utilisé');
    }

    const user = await this.usersService.create(createUserDto);
    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const isPasswordValid = await this.usersService.validatePassword(
      loginDto.mdp,
      user.mdp,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
      },
    };
  }
}
