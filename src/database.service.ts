import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  onModuleInit() {
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      database: 'test',
      user: 'postgres',
      password: '0000',
    });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query(text: string, params?: any[]) {
    const result = await this.pool.query(text, params);
    return result;
  }
}
