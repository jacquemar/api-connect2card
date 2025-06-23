import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, Headers, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré avec succès' })
  @ApiResponse({ status: 401, description: 'Non autorisé - Token manquant ou invalide' })
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.usersService.getCurrentUser(token);
  }

  @Get('users/:userName')
  @ApiOperation({ summary: 'Récupérer un utilisateur par nom d\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getUserByUserName(@Param('userName') userName: string) {
    return this.usersService.getUserByUserName(userName);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs (Admin)' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getAllUsers() {
    return this.usersService.getAllUsers();
  }

  @Get('check-email')
  @ApiOperation({ summary: 'Vérifier la disponibilité d\'un email' })
  @ApiResponse({ status: 200, description: 'Statut de disponibilité de l\'email' })
  async checkEmail(@Query('email') email: string) {
    return this.usersService.checkEmailExists(email);
  }

  @Get('check-username')
  @ApiOperation({ summary: 'Vérifier la disponibilité d\'un nom d\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Statut de disponibilité du nom d\'utilisateur' })
  async checkUsername(@Query('userName') userName: string) {
    return this.usersService.checkUsernameExists(userName);
  }

  @Post('users/:userName/increment-download')
  @ApiOperation({ summary: 'Incrémenter le compteur de téléchargements vCard' })
  @ApiResponse({ status: 200, description: 'Compteur incrémenté' })
  async incrementVcardDownload(@Param('userName') userName: string) {
    return this.usersService.incrementVcardDownload(userName);
  }

  @Post('users/:userName/increment-visit')
  @ApiOperation({ summary: 'Incrémenter le compteur de visites' })
  @ApiResponse({ status: 200, description: 'Visite enregistrée' })
  async incrementVisit(@Param('userName') userName: string) {
    return this.usersService.incrementVisit(userName);
  }

  @Get('users/:userName/visits-history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Récupérer l\'historique des visites' })
  @ApiResponse({ status: 200, description: 'Historique récupéré' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getVisitsHistory(@Param('userName') userName: string, @Query('period') period: string) {
    return this.usersService.getVisitsHistory(userName, period);
  }

  @Delete('user/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin)' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
} 