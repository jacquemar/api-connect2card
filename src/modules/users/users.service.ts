import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import {
  CreateUserDto,
  UpdateUserProfileDto,
  CheckEmailDto,
  CheckUsernameDto,
} from '../../common/dto/user.dto';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { Demande, DemandeDocument } from '../../common/schemas/demande.schema';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Demande.name) private demandeModel: Model<DemandeDocument>,
    private readonly jwtService: JwtService,
  ) {}

  async getCurrentUser(token: string): Promise<UserDocument> {
    try {
      if (!token) {
        throw new BadRequestException("Token manquant dans l'en-tête");
      }

      const decodedToken = this.jwtService.verify(token);
      const userName = decodedToken.userName;

      const user = await this.userModel.findOne({ userName: userName });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé.');
      }

      return user;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des informations utilisateur :',
        error,
      );
      throw error;
    }
  }

  async getUserByUserName(userName: string): Promise<UserDocument> {
    try {
      const user = await this.userModel.findOne({ userName: userName });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé.');
      }
      return user;
    } catch (error) {
      console.error(
        'Erreur lors de la récupération des informations utilisateur:',
        error,
      );
      throw error;
    }
  }

  async getAllUsers(): Promise<UserDocument[]> {
    try {
      return await this.userModel.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw error;
    }
  }

  async checkEmailExists(email: string): Promise<{ exists: boolean }> {
    try {
      const existingUser = await this.userModel.findOne({ email });
      const existingDemande = await this.demandeModel.findOne({ email });

      const exists = existingUser || existingDemande;

      return { exists: !!exists };
    } catch (error) {
      console.error("Erreur lors de la vérification de l'email:", error);
      throw error;
    }
  }

  async checkUsernameExists(userName: string): Promise<{ exists: boolean }> {
    try {
      const existingUser = await this.userModel.findOne({ userName });
      const existingDemande = await this.demandeModel.findOne({ userName });

      const exists = existingUser || existingDemande;

      return { exists: !!exists };
    } catch (error) {
      console.error(
        "Erreur lors de la vérification du nom d'utilisateur:",
        error,
      );
      throw error;
    }
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserDocument> {
    try {
      // Vérifier si l'utilisateur existe déjà
      const existingUser = await this.checkUsernameExists(
        createUserDto.userName,
      );
      if (existingUser.exists) {
        throw new BadRequestException('Cet utilisateur est déjà utilisé.');
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Créer un nouvel utilisateur
      const newUser = new this.userModel({
        ...createUserDto,
        password: hashedPassword,
        photoProfilURL:
          'https://via.placeholder.com/150/000000/FFFFFF/?text=Profile',
        banniereURL:
          'https://via.placeholder.com/800x200/000000/FFFFFF/?text=Banner',
      });

      // Sauvegarder le nouvel utilisateur
      await newUser.save();

      return newUser;
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'utilisateur :",
        error,
      );
      throw error;
    }
  }

  async updateUserProfile(
    userName: string,
    updateUserProfileDto: UpdateUserProfileDto,
  ): Promise<{ message: string; remainingCredits: number }> {
    try {
      // Récupérer l'utilisateur à mettre à jour
      const user = await this.userModel.findOne({ userName });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      if (!user.isActive) {
        throw new BadRequestException('Le profil est désactivé');
      }

      // Mettre à jour uniquement les champs fournis
      for (const key of Object.keys(updateUserProfileDto)) {
        const value = updateUserProfileDto[key];
        if (typeof value !== 'undefined') {
          user[key] = value;
        }
      }

      if (user.credit > 0) {
        user.credit -= 1;
      }

      // Sauvegarder les modifications
      await user.save();

      return {
        message: 'Profil utilisateur mis à jour avec succès',
        remainingCredits: user.credit || 0,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async toggleUserStatus(
    userName: string,
  ): Promise<{ message: string; isActive: boolean }> {
    try {
      // Trouver et basculer le statut de l'utilisateur
      const user = await this.userModel.findOne({ userName });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Basculer le statut
      user.isActive = !user.isActive;
      await user.save();

      return {
        message: `Profil ${user.isActive ? 'activé' : 'désactivé'} avec succès`,
        isActive: user.isActive,
      };
    } catch (error) {
      console.error('Erreur lors du basculement du statut du profil:', error);
      throw error;
    }
  }

  async toggleUserSuspension(
    userName: string,
  ): Promise<{ message: string; isSuspended: boolean; isActive: boolean }> {
    try {
      // Trouver et basculer la suspension de l'utilisateur
      const user = await this.userModel.findOne({ userName });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Basculer la suspension
      user.isSuspended = !user.isSuspended;
      if (user.isSuspended) {
        user.isActive = false;
      }
      await user.save();

      return {
        message: `Compte ${user.isSuspended ? 'suspendu' : 'réactivé'} avec succès`,
        isSuspended: user.isSuspended,
        isActive: user.isActive,
      };
    } catch (error) {
      console.error(
        "Erreur lors de la modification de l'état de suspension:",
        error,
      );
      throw error;
    }
  }

  async deleteUser(id: string): Promise<{ message: string }> {
    try {
      // Chercher l'utilisateur par son ID et le supprimer
      const deletedUser = await this.userModel.findByIdAndDelete(id);

      if (!deletedUser) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      return { message: 'Utilisateur supprimé avec succès' };
    } catch (error) {
      console.error("Erreur lors de la suppression de l'utilisateur :", error);
      throw error;
    }
  }

  async incrementVcardDownload(userName: string): Promise<{ message: string }> {
    try {
      // Recherche de l'utilisateur et incrémenter le compteur
      const user = await this.userModel.findOne({ userName });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé.');
      }

      // Incrémenter le compteur
      user.vcardDownloadsCount = (user.vcardDownloadsCount || 0) + 1;
      await user.save();

      return {
        message: 'Le compteur de téléchargements a été incrémenté avec succès.',
      };
    } catch (error) {
      console.error(
        "Erreur lors de l'incrémentation du compteur de téléchargements :",
        error,
      );
      throw error;
    }
  }

  async generateVcard(userName: string): Promise<string> {
    try {
      // Recherche de l'utilisateur
      const user = await this.userModel.findOne({ userName });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé.');
      }

      // Génération du contenu vCard
      const vCardContent = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${user.nomComplet || user.userName}`,
        `N:${user.nomComplet ? user.nomComplet.split(' ').slice(-1)[0] : ''};${user.nomComplet ? user.nomComplet.split(' ').slice(0, -1).join(' ') : user.userName};;;`,
        user.titre ? `TITLE:${user.titre}` : '',
        user.phoneNumber ? `TEL:${user.phoneNumber}` : '',
        user.email ? `EMAIL:${user.email}` : '',
        user.web ? `URL:${user.web}` : '',
        user.address ? `ADR:;;${user.address};;;;` : '',
        user.facebook ? `X-SOCIALPROFILE;TYPE=facebook:${user.facebook}` : '',
        user.instagram
          ? `X-SOCIALPROFILE;TYPE=instagram:${user.instagram}`
          : '',
        user.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:${user.linkedin}` : '',
        user.twitter ? `X-SOCIALPROFILE;TYPE=twitter:${user.twitter}` : '',
        user.whatsapp ? `X-SOCIALPROFILE;TYPE=whatsapp:${user.whatsapp}` : '',
        user.photoProfilURL ? `PHOTO:${user.photoProfilURL}` : '',
        `NOTE:Carte de visite numérique Connect2Card - ${user.userName}`,
        'END:VCARD',
      ]
        .filter((line) => line.trim() !== '')
        .join('\r\n');

      return vCardContent;
    } catch (error) {
      console.error('Erreur lors de la génération de la vCard :', error);
      throw error;
    }
  }

  async incrementVisit(userName: string): Promise<{ message: string }> {
    try {
      // Logique d'incrémentation des visites avec historique
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const user = await this.userModel.findOne({ userName });
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Incrémenter le compteur de visites
      user.visitscount = (user.visitscount || 0) + 1;

      // Ajouter à l'historique des visites
      if (!user.visitsHistory) {
        user.visitsHistory = [];
      }

      // Vérifier si on a déjà une entrée pour aujourd'hui
      const todayEntry = user.visitsHistory.find(
        (entry) => entry.date.toDateString() === today.toDateString(),
      );

      if (todayEntry) {
        todayEntry.count += 1;
      } else {
        user.visitsHistory.push({ date: today, count: 1 });
      }

      await user.save();

      return { message: 'Visite enregistrée avec succès' };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la visite:", error);
      throw error;
    }
  }

  async getVisitsHistory(userName: string, period: string): Promise<any[]> {
    try {
      // Récupérer l'historique des visites selon la période
      const user = await this.userModel.findOne({ userName });
      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      if (!user.visitsHistory || user.visitsHistory.length === 0) {
        return [];
      }

      // Filtrer selon la période
      const now = new Date();
      let startDate = new Date();

      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          startDate.setDate(now.getDate() - 7); // Par défaut: semaine
      }

      return user.visitsHistory
        .filter((entry) => entry.date >= startDate)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
    } catch (error) {
      console.error(
        "Erreur lors de la récupération de l'historique des visites:",
        error,
      );
      throw error;
    }
  }
}
