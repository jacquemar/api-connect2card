import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  LoginDto,
  ForgotPasswordDto,
  AdminLoginDto,
} from '../../common/dto/auth.dto';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { EmailService } from '../../services/email.service';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ token: string; user: any }> {
    const { userName, password } = loginDto;

    try {
      // Recherche de l'utilisateur dans la base de données
      const user = await this.userModel.findOne({ userName });
      console.log('Utilisateur trouvé :', user);

      if (!user) {
        console.log('Utilisateur non trouvé');
        throw new UnauthorizedException(
          "Nom d'utilisateur ou mot de passe incorrect.",
        );
      }

      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Mot de passe valide:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Mot de passe incorrect');
        throw new UnauthorizedException(
          "Nom d'utilisateur ou mot de passe incorrect.",
        );
      }

      // Créer le token JWT avec plus d'informations
      const payload = {
        userName: user.userName,
        userId: user._id,
        role: user.role,
        email: user.email,
        iat: Math.floor(Date.now() / 1000), // Timestamp actuel
      };

      const token = this.jwtService.sign(payload);

      // Retourner le token et les informations de l'utilisateur (sans le mot de passe)
      const userResponse = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        nomComplet: user.nomComplet,
        photoProfilURL: user.photoProfilURL,
      };

      return {
        token,
        user: userResponse,
      };
    } catch (error) {
      console.error('Erreur lors de la connexion :', error);
      throw new UnauthorizedException('Erreur lors de la connexion');
    }
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
    req: Request,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    try {
      // Recherche de l'utilisateur par email
      const user = await this.userModel.findOne({ email });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      const token = crypto.randomBytes(20).toString('hex');

      // Obtenir les informations de la requête
      const ipAddress = Array.isArray(req.headers['x-forwarded-for'])
        ? req.headers['x-forwarded-for'][0]
        : req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = Array.isArray(req.headers['user-agent'])
        ? req.headers['user-agent'][0]
        : req.headers['user-agent'] || 'Unknown';

      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0; font-size: 28px;">🔐 Réinitialisation de mot de passe</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Bonjour <strong>${user.userName}</strong>,
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Vous avez demandé une réinitialisation de mot de passe pour votre compte Connect2Card.
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://${req.headers.host}/reset-password/${token}" 
                 style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                🔑 Réinitialiser le mot de passe
              </a>
            </div>
            
            <div style="background: #e9ecef; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4 style="margin-top: 0; color: #495057;">📋 Informations de la demande:</h4>
              <p style="margin: 5px 0; color: #6c757d;"><strong>IP:</strong> ${ipAddress}</p>
              <p style="margin: 5px 0; color: #6c757d;"><strong>Navigateur:</strong> ${userAgent}</p>
            </div>
            
            <p style="font-size: 14px; color: #6c757d; text-align: center; margin-top: 30px;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
        </div>
      `;

      await this.emailService.sendEmail({
        to: user.email,
        subject: 'Réinitialisation de mot de passe - Connect2Card',
        html: htmlContent,
      });

      return {
        message: `Un e-mail de réinitialisation a été envoyé à ${user.email}`,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
      throw error;
    }
  }

  async adminLogin(
    adminLoginDto: AdminLoginDto,
  ): Promise<{ token: string; user: any }> {
    const { email, password } = adminLoginDto;

    try {
      // Recherche de l'utilisateur admin par email
      const user = await this.userModel.findOne({ email, role: 'admin' });
      console.log('Admin trouvé :', user);

      if (!user) {
        console.log('Admin non trouvé');
        throw new UnauthorizedException('Email ou mot de passe incorrect.');
      }

      // Vérification du mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Mot de passe admin valide:', isPasswordValid);

      if (!isPasswordValid) {
        console.log('Mot de passe admin incorrect');
        throw new UnauthorizedException('Email ou mot de passe incorrect.');
      }

      // Créer le token JWT avec plus d'informations
      const payload = {
        userName: user.userName,
        userId: user._id,
        role: user.role,
        email: user.email,
        iat: Math.floor(Date.now() / 1000), // Timestamp actuel
      };

      const token = this.jwtService.sign(payload);

      // Retourner le token et les informations de l'utilisateur (sans le mot de passe)
      const userResponse = {
        _id: user._id,
        userName: user.userName,
        email: user.email,
        role: user.role,
        nomComplet: user.nomComplet,
        photoProfilURL: user.photoProfilURL,
      };

      return {
        token,
        user: userResponse,
      };
    } catch (error) {
      console.error('Erreur lors de la connexion admin :', error);
      throw new UnauthorizedException('Erreur lors de la connexion admin');
    }
  }

  async createDefaultAdmin(): Promise<{ message: string; admin: any }> {
    try {
      // Vérifier si l'admin existe déjà
      const existingAdmin = await this.userModel.findOne({
        email: 'arnaude.timite12@gmail.com',
        role: 'admin',
      });

      if (existingAdmin) {
        return {
          message: "L'administrateur existe déjà dans la base de données",
          admin: {
            email: existingAdmin.email,
            userName: existingAdmin.userName,
            role: existingAdmin.role,
          },
        };
      }

      // Hasher le mot de passe
      const hashedPassword = await this.hashPassword('azerty123');

      // Créer l'utilisateur admin
      const adminUser = new this.userModel({
        userName: 'admin',
        email: 'arnaude.timite12@gmail.com',
        password: hashedPassword,
        nomComplet: 'Arnaud Timite',
        role: 'admin',
        isActive: true,
        isSuspended: false,
        credit: 1000,
        level: '1',
        profil: 'admin',
      });

      await adminUser.save();

      return {
        message: 'Administrateur créé avec succès !',
        admin: {
          email: adminUser.email,
          userName: adminUser.userName,
          role: adminUser.role,
          nomComplet: adminUser.nomComplet,
        },
      };
    } catch (error) {
      console.error("Erreur lors de la création de l'administrateur:", error);
      throw new Error("Erreur lors de la création de l'administrateur");
    }
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async comparePasswords(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}
