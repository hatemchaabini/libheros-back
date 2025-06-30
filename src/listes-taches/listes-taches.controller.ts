import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ListesTachesService,
  CreateListeTachesDto,
  UpdateListeTachesDto,
} from './listes-taches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('listes')
@UseGuards(JwtAuthGuard)
export class ListesTachesController {
  constructor(private readonly listesTachesService: ListesTachesService) {}

  @Post()
  create(@Body() createDto: CreateListeTachesDto, @Request() req) {
    return this.listesTachesService.create(createDto, req.user.id);
  }

  @Get()
  findAll(@Request() req) {
    return this.listesTachesService.findAllByUser(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.listesTachesService.findOne(+id, req.user.id);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateListeTachesDto,
    @Request() req,
  ) {
    return this.listesTachesService.update(+id, updateDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.listesTachesService.remove(+id, req.user.id);
  }
}
