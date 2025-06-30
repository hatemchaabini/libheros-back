import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  TachesService,
  CreateTacheDto,
  UpdateTacheDto,
} from './taches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class TachesController {
  constructor(private readonly tachesService: TachesService) {}

  @Post('listes/:listeId/taches')
  create(
    @Param('listeId') listeId: string,
    @Body() createDto: CreateTacheDto,
    @Request() req,
  ) {
    return this.tachesService.create(+listeId, createDto, req.user.id);
  }

  @Get('listes/:listeId/taches')
  findAllByListe(@Param('listeId') listeId: string, @Request() req) {
    return this.tachesService.findAllByListe(+listeId, req.user.id);
  }

  @Get('taches/:id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.tachesService.findOne(+id, req.user.id);
  }

  @Put('taches/:id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateTacheDto,
    @Request() req,
  ) {
    return this.tachesService.update(+id, updateDto, req.user.id);
  }

  @Delete('taches/:id')
  remove(@Param('id') id: string, @Request() req) {
    return this.tachesService.remove(+id, req.user.id);
  }

  @Patch('taches/:id/toggle')
  toggleTerminee(@Param('id') id: string, @Request() req) {
    return this.tachesService.toggleTerminee(+id, req.user.id);
  }
}
