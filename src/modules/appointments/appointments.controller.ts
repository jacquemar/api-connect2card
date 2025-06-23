import { Controller, Get, Post, Delete, Body, Param, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Appointments')
@Controller()
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('appointments')
  @ApiOperation({ summary: 'Créer un rendez-vous' })
  @ApiResponse({ status: 201, description: 'Rendez-vous créé avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur propriétaire non trouvé' })
  async createAppointment(@Body() createAppointmentDto: any) {
    return this.appointmentsService.createAppointment(createAppointmentDto);
  }

  @Get('appointments/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer mes rendez-vous' })
  @ApiResponse({ status: 200, description: 'Liste des rendez-vous' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token requis' })
  async getMyAppointments(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.appointmentsService.getMyAppointments(token);
  }

  @Delete('appointments/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un rendez-vous' })
  @ApiResponse({ status: 200, description: 'Rendez-vous supprimé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Rendez-vous non trouvé' })
  async deleteAppointment(@Param('id') id: string, @Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.appointmentsService.deleteAppointment(id, token);
  }
} 