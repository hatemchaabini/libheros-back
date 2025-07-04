// Task lists management service with CRUD operations
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database.service';

export interface ListeTaches {
  id: number;
  nom: string;
  utilisateur_id: number;
  cree_le: Date;
  modifie_le: Date;
}

export interface CreateListeTachesDto {
  nom: string;
}

export interface UpdateListeTachesDto {
  nom: string;
}

@Injectable()
export class ListesTachesService {
  constructor(private databaseService: DatabaseService) {}

  async create(
    createDto: CreateListeTachesDto,
    utilisateurId: number,
  ): Promise<ListeTaches> {
    const result = await this.databaseService.query(
      'INSERT INTO listes_taches (nom, utilisateur_id) VALUES ($1, $2) RETURNING *',
      [createDto.nom, utilisateurId],
    );
    return result.rows[0];
  }

  async findAllByUser(utilisateurId: number): Promise<ListeTaches[]> {
    const result = await this.databaseService.query(
      'SELECT * FROM listes_taches WHERE utilisateur_id = $1 ORDER BY cree_le DESC',
      [utilisateurId],
    );
    return result.rows;
  }

  async findOne(id: number, utilisateurId: number): Promise<ListeTaches> {
    const result = await this.databaseService.query(
      'SELECT * FROM listes_taches WHERE id = $1 AND utilisateur_id = $2',
      [id, utilisateurId],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('Liste de tâches non trouvée');
    }

    return result.rows[0];
  }

  async update(
    id: number,
    updateDto: UpdateListeTachesDto,
    utilisateurId: number,
  ): Promise<ListeTaches> {
    // Vérifier que la liste appartient à l'utilisateur
    await this.findOne(id, utilisateurId);

    const result = await this.databaseService.query(
      'UPDATE listes_taches SET nom = $1, modifie_le = CURRENT_TIMESTAMP WHERE id = $2 AND utilisateur_id = $3 RETURNING *',
      [updateDto.nom, id, utilisateurId],
    );

    return result.rows[0];
  }

  async remove(id: number, utilisateurId: number): Promise<void> {
    // Vérifier que la liste appartient à l'utilisateur
    await this.findOne(id, utilisateurId);

    await this.databaseService.query(
      'DELETE FROM listes_taches WHERE id = $1 AND utilisateur_id = $2',
      [id, utilisateurId],
    );
  }
}
