import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { RendezVousService } from './rendez-vous.service';

@Controller()
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  @Post('rendez-vous')
  async createRendezVous(@Body() createRendezVousDto: any) {
    return this.rendezVousService.createRendezVous(createRendezVousDto);
  }

  @Get('users/:userName/rendez-vous')
  async getRendezVousByUser(
    @Param('userName') userName: string,
    @Query('statut') statut?: string,
  ) {
    return this.rendezVousService.getRendezVousByUser(userName, statut);
  }

  @Patch('rendez-vous/:id/statut')
  async updateRendezVousStatus(
    @Param('id') id: string,
    @Body('statut') statut: string,
  ) {
    return this.rendezVousService.updateRendezVousStatus(id, statut);
  }
}
