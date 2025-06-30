import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database.service';
import { ListesTachesService } from '../listes-taches/listes-taches.service';

export interface Tache {
  id: number;
  liste_id: number;
  description_courte: string;
  description_longue: string | null;
  date_echeance: Date;
  est_terminee: boolean;
  cree_le: Date;
  modifie_le: Date;
}

export interface CreateTacheDto {
  description_courte: string;
  description_longue?: string;
  date_echeance: string; // Format YYYY-MM-DD
}

export interface UpdateTacheDto {
  description_courte?: string;
  description_longue?: string;
  date_echeance?: string;
  est_terminee?: boolean;
}

@Injectable()
export class TachesService {
  constructor(
    private databaseService: DatabaseService,
    private listesTachesService: ListesTachesService,
  ) {}

  async create(
    listeId: number,
    createDto: CreateTacheDto,
    utilisateurId: number,
  ): Promise<Tache> {
    // Vérifier que la liste appartient à l'utilisateur
    await this.listesTachesService.findOne(listeId, utilisateurId);

    const result = await this.databaseService.query(
      'INSERT INTO taches (liste_id, description_courte, description_longue, date_echeance) VALUES ($1, $2, $3, $4) RETURNING *',
      [
        listeId,
        createDto.description_courte,
        createDto.description_longue || null,
        createDto.date_echeance,
      ],
    );
    return result.rows[0];
  }

  async findAllByListe(
    listeId: number,
    utilisateurId: number,
  ): Promise<Tache[]> {
    // Vérifier que la liste appartient à l'utilisateur
    await this.listesTachesService.findOne(listeId, utilisateurId);

    const result = await this.databaseService.query(
      'SELECT * FROM taches WHERE liste_id = $1 ORDER BY date_echeance ASC, cree_le DESC',
      [listeId],
    );
    return result.rows;
  }

  async findOne(id: number, utilisateurId: number): Promise<Tache> {
    const result = await this.databaseService.query(
      `SELECT t.* FROM taches t 
       JOIN listes_taches lt ON t.liste_id = lt.id 
       WHERE t.id = $1 AND lt.utilisateur_id = $2`,
      [id, utilisateurId],
    );

    if (!result.rows[0]) {
      throw new NotFoundException('Tâche non trouvée');
    }

    return result.rows[0];
  }

  async update(
    id: number,
    updateDto: UpdateTacheDto,
    utilisateurId: number,
  ): Promise<Tache> {
    // Vérifier que la tâche appartient à l'utilisateur
    await this.findOne(id, utilisateurId);

    const setClauses: string[] = [];
    const values: any[] = [];
    let valueIndex = 1;

    if (updateDto.description_courte !== undefined) {
      setClauses.push(`description_courte = $${valueIndex++}`);
      values.push(updateDto.description_courte);
    }
    if (updateDto.description_longue !== undefined) {
      setClauses.push(`description_longue = $${valueIndex++}`);
      values.push(updateDto.description_longue);
    }
    if (updateDto.date_echeance !== undefined) {
      setClauses.push(`date_echeance = $${valueIndex++}`);
      values.push(updateDto.date_echeance);
    }
    if (updateDto.est_terminee !== undefined) {
      setClauses.push(`est_terminee = $${valueIndex++}`);
      values.push(updateDto.est_terminee);
    }

    setClauses.push('modifie_le = CURRENT_TIMESTAMP');
    values.push(id);

    const result = await this.databaseService.query(
      `UPDATE taches SET ${setClauses.join(', ')} WHERE id = $${valueIndex} RETURNING *`,
      values,
    );

    return result.rows[0];
  }

  async remove(id: number, utilisateurId: number): Promise<void> {
    // Vérifier que la tâche appartient à l'utilisateur
    await this.findOne(id, utilisateurId);

    await this.databaseService.query('DELETE FROM taches WHERE id = $1', [id]);
  }

  async toggleTerminee(id: number, utilisateurId: number): Promise<Tache> {
    // Vérifier que la tâche appartient à l'utilisateur
    await this.findOne(id, utilisateurId);

    const result = await this.databaseService.query(
      'UPDATE taches SET est_terminee = NOT est_terminee, modifie_le = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *',
      [id],
    );

    return result.rows[0];
  }
}
