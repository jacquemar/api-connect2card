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
import * as nodemailer from 'nodemailer';
import { LoginDto, ForgotPasswordDto } from '../../common/dto/auth.dto';
import { User, UserDocument } from '../../common/schemas/user.schema';

@Injectable()
export class AuthService {
  private readonly saltRounds = 10;
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {
    // Configuration du transporteur email
    this.transporter = nodemailer.createTransport({
      host: process.env.USERHOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.USERSMTP,
        pass: process.env.PASSWORDSMTP,
      },
    });
  }

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

      // TODO: Sauvegarder le token et l'expiration dans la base de données
      // user.resetPasswordToken = token;
      // user.resetPasswordExpires = Date.now() + 3600000; // 1 heure
      // await user.save();

      // Obtenir les informations de la requête
      const ipAddress =
        req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const mailOptions = {
        to: user.email,
        from: '"CONNECT TEAM" <support@connect2card.com>',
        subject: 'Réinitialisation de mot de passe',
        html: `
          <p>Bonjour ${user.userName},</p>
          <p>Vous avez demandé une réinitialisation de mot de passe.</p>
          <p>Cliquez sur ce lien pour réinitialiser votre mot de passe:</p>
          <a href="http://${req.headers.host}/reset-password/${token}">Réinitialiser le mot de passe</a>
          <p>Informations de la demande:</p>
          <p>IP: ${ipAddress}</p>
          <p>Navigateur: ${userAgent}</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);

      return {
        message: `Un e-mail de réinitialisation a été envoyé à ${user.email}`,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'e-mail:", error);
      throw error;
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
