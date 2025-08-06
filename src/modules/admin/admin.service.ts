import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../common/schemas/user.schema';

@Injectable()
export class AdminService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async getDashboardStats() {
    try {
      const totalUsers = await this.userModel.countDocuments();
      const activeUsers = await this.userModel.countDocuments({
        isActive: true,
      });
      const suspendedUsers = await this.userModel.countDocuments({
        isSuspended: true,
      });
      const adminUsers = await this.userModel.countDocuments({ role: 'admin' });

      // Statistiques des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const newUsersThisWeek = await this.userModel.countDocuments({
        createdAt: { $gte: sevenDaysAgo },
      });

      return {
        totalUsers,
        activeUsers,
        suspendedUsers,
        adminUsers,
        newUsersThisWeek,
        lastUpdated: new Date(),
      };
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la récupération des statistiques',
      );
    }
  }

  async getUsers(page: number = 1, limit: number = 10, search?: string) {
    try {
      const skip = (page - 1) * limit;

      let query = {};
      if (search) {
        query = {
          $or: [
            { userName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { nomComplet: { $regex: search, $options: 'i' } },
          ],
        };
      }

      const users = await this.userModel
        .find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await this.userModel.countDocuments(query);

      return {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Erreur lors de la récupération des utilisateurs',
      );
    }
  }

  async getUserById(id: string) {
    try {
      const user = await this.userModel.findById(id).select('-password');

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        "Erreur lors de la récupération de l'utilisateur",
      );
    }
  }

  async updateUserStatus(
    id: string,
    body: { isActive: boolean; isSuspended: boolean },
  ) {
    try {
      const user = await this.userModel
        .findByIdAndUpdate(
          id,
          {
            isActive: body.isActive,
            isSuspended: body.isSuspended,
          },
          { new: true },
        )
        .select('-password');

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return {
        message: "Statut de l'utilisateur mis à jour avec succès",
        user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erreur lors de la mise à jour du statut');
    }
  }

  async deleteUser(id: string) {
    try {
      const user = await this.userModel.findByIdAndDelete(id);

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return {
        message: 'Utilisateur supprimé avec succès',
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException(
        "Erreur lors de la suppression de l'utilisateur",
      );
    }
  }

  async getAdminProfile(adminId: string) {
    try {
      const admin = await this.userModel.findById(adminId).select('-password');

      if (!admin) {
        throw new NotFoundException('Administrateur non trouvé');
      }

      if (admin.role !== 'admin') {
        throw new BadRequestException(
          'Accès refusé. Rôle administrateur requis.',
        );
      }

      return admin;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException(
        'Erreur lors de la récupération du profil admin',
      );
    }
  }
}
