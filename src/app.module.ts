import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ListesTachesModule } from './listes-taches/listes-taches.module';
import { TachesModule } from './taches/taches.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    ListesTachesModule,
    TachesModule,
  ],
})
export class AppModule {}
