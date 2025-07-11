import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Headers,
  UseGuards,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: "Récupérer l'utilisateur connecté" })
  @ApiResponse({ status: 200, description: 'Utilisateur récupéré avec succès' })
  @ApiResponse({
    status: 401,
    description: 'Non autorisé - Token manquant ou invalide',
  })
  async getCurrentUser(@Headers('authorization') authHeader: string) {
    const token = authHeader?.split(' ')[1];
    return this.usersService.getCurrentUser(token);
  }

  @Get('users/:userName')
  @ApiOperation({ summary: "Récupérer un utilisateur par nom d'utilisateur" })
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
  @ApiOperation({ summary: "Vérifier la disponibilité d'un email" })
  @ApiResponse({
    status: 200,
    description: "Statut de disponibilité de l'email",
  })
  async checkEmail(@Query('email') email: string) {
    return this.usersService.checkEmailExists(email);
  }

  @Get('check-username')
  @ApiOperation({ summary: "Vérifier la disponibilité d'un nom d'utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Statut de disponibilité du nom d'utilisateur",
  })
  async checkUsername(@Query('userName') userName: string) {
    return this.usersService.checkUsernameExists(userName);
  }

  @Get('users/:userName/vcard')
  @ApiOperation({ summary: 'Télécharger la vCard de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'vCard téléchargée avec succès' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async downloadVcard(
    @Param('userName') userName: string,
    @Res() res: Response,
  ) {
    try {
      const vCardContent = await this.usersService.generateVcard(userName);
      
      // Incrémenter le compteur de téléchargements
      await this.usersService.incrementVcardDownload(userName);
      
      // Configurer les en-têtes pour le téléchargement
      res.setHeader('Content-Type', 'text/vcard');
      res.setHeader('Content-Disposition', `attachment; filename="${userName}.vcf"`);
      res.setHeader('Content-Length', Buffer.byteLength(vCardContent, 'utf8'));
      
      return res.send(vCardContent);
    } catch (error) {
      return res.status(404).json({ 
        message: 'Utilisateur non trouvé', 
        error: error.message 
      });
    }
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
  @ApiOperation({ summary: "Récupérer l'historique des visites" })
  @ApiResponse({ status: 200, description: 'Historique récupéré' })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  async getVisitsHistory(
    @Param('userName') userName: string,
    @Query('period') period: string,
  ) {
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
