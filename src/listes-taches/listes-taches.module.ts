import { Module } from '@nestjs/common';
import { ListesTachesService } from './listes-taches.service';
import { ListesTachesController } from './listes-taches.controller';

@Module({
  providers: [ListesTachesService],
  controllers: [ListesTachesController],
  exports: [ListesTachesService],
})
export class ListesTachesModule {}
