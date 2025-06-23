import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { DemandesService } from './demandes.service';

@Controller()
export class DemandesController {
  constructor(private readonly demandesService: DemandesService) {}

  @Post('create-demande')
  async createDemande(@Body() createDemandeDto: any) {
    return this.demandesService.createDemande(createDemandeDto);
  }

  @Get('api/demandes')
  async getAllDemandes() {
    return this.demandesService.getAllDemandes();
  }

  @Post('api/demandes/:id/approve')
  async approveDemande(@Param('id') id: string) {
    return this.demandesService.approveDemande(id);
  }

  @Post('api/demandes/:id/reject')
  async rejectDemande(@Param('id') id: string) {
    return this.demandesService.rejectDemande(id);
  }

  @Delete('api/demandes/:id')
  async deleteDemande(@Param('id') id: string) {
    return this.demandesService.deleteDemande(id);
  }
} 