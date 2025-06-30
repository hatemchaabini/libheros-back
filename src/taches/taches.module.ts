import { Module } from '@nestjs/common';
import { TachesService } from './taches.service';
import { TachesController } from './taches.controller';
import { ListesTachesModule } from '../listes-taches/listes-taches.module';

@Module({
  imports: [ListesTachesModule],
  providers: [TachesService],
  controllers: [TachesController],
})
export class TachesModule {}
