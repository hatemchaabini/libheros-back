// User management service with bcrypt password hashing
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import * as bcrypt from 'bcrypt';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  mdp: string;
  created_at: Date;
}

export interface CreateUserDto {
  nom: string;
  prenom: string;
  email: string;
  mdp: string;
}

@Injectable()
export class UsersService {
  constructor(private databaseService: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.mdp, 10);
    
    const result = await this.databaseService.query(
      'INSERT INTO Users (nom, prenom, email, mdp) VALUES ($1, $2, $3, $4) RETURNING *',
      [createUserDto.nom, createUserDto.prenom, createUserDto.email, hashedPassword]
    );
    
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.databaseService.query(
      'SELECT * FROM Users WHERE email = $1',
      [email]
    );
    
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await this.databaseService.query(
      'SELECT * FROM Users WHERE id = $1',
      [id]
    );
    
    return result.rows[0] || null;
  }

  async validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
} 