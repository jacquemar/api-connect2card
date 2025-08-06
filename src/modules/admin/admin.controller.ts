import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';
import { AdminService } from './admin.service';

@ApiTags('Admin')
@Controller('admin')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtenir les statistiques du dashboard admin' })
  @ApiResponse({
    status: 200,
    description: 'Statistiques du dashboard récupérées avec succès',
  })
  async getDashboardStats(@CurrentAdmin() admin: any) {
    return this.adminService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'Obtenir la liste des utilisateurs' })
  @ApiResponse({
    status: 200,
    description: 'Liste des utilisateurs récupérée avec succès',
  })
  async getUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('search') search?: string,
  ) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Get('users/:id')
  @ApiOperation({ summary: "Obtenir les détails d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Détails de l'utilisateur récupérés avec succès",
  })
  async getUserById(@Param('id') id: string) {
    return this.adminService.getUserById(id);
  }

  @Put('users/:id/status')
  @ApiOperation({ summary: "Modifier le statut d'un utilisateur" })
  @ApiResponse({
    status: 200,
    description: "Statut de l'utilisateur modifié avec succès",
  })
  async updateUserStatus(
    @Param('id') id: string,
    @Body() body: { isActive: boolean; isSuspended: boolean },
  ) {
    return this.adminService.updateUserStatus(id, body);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({
    status: 200,
    description: 'Utilisateur supprimé avec succès',
  })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Get('profile')
  @ApiOperation({ summary: "Obtenir le profil de l'administrateur connecté" })
  @ApiResponse({
    status: 200,
    description: "Profil de l'administrateur récupéré avec succès",
  })
  async getAdminProfile(@CurrentAdmin() admin: any) {
    return this.adminService.getAdminProfile(admin.userId);
  }
}
