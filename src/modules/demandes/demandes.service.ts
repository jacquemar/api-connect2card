import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as nodemailer from 'nodemailer';
import * as QRCode from 'qrcode';
import { Demande, DemandeDocument } from '../../common/schemas/demande.schema';
import { User, UserDocument } from '../../common/schemas/user.schema';

@Injectable()
export class DemandesService {
  private readonly saltRounds = 10;
  private transporter: nodemailer.Transporter;

  constructor(
    @InjectModel(Demande.name) private demandeModel: Model<DemandeDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {
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

  async createDemande(createDemandeDto: any): Promise<any> {
    try {
      // Rechercher si l'utilisateur existe déjà
      const existingUser = await this.userModel.findOne({
        userName: createDemandeDto.userName,
      });
      if (existingUser) {
        throw new Error('Cet utilisateur est déjà utilisé.');
      }

      const hashedPassword = await bcrypt.hash(
        createDemandeDto.password,
        this.saltRounds,
      );

      // Créer une nouvelle demande
      const newDemande = new this.demandeModel({
        userName: createDemandeDto.userName,
        email: createDemandeDto.email,
        phoneNumber: createDemandeDto.phoneNumber,
        password: hashedPassword,
        nom: createDemandeDto.nom,
        prenom: createDemandeDto.prenom,
        date: createDemandeDto.date,
      });

      // Sauvegarder la demande
      await newDemande.save();

      // TODO: Enregistrer dans Notion si nécessaire
      // const newPage = await notion.pages.create({...});

      // Envoyer l'e-mail de confirmation
      await this.sendConfirmationEmail(createDemandeDto);

      return { message: 'Demande enregistrée avec succès', data: newDemande };
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la demande :", error);
      throw error;
    }
  }

  async getAllDemandes(): Promise<DemandeDocument[]> {
    try {
      // Récupérer toutes les demandes
      return await this.demandeModel.find().sort({ createdAt: -1 });
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      throw error;
    }
  }

  async approveDemande(
    id: string,
  ): Promise<{ message: string; qrCode?: string }> {
    try {
      // Trouver la demande et l'approuver
      const demande = await this.demandeModel.findById(id);

      if (!demande) {
        throw new NotFoundException('Demande non trouvée');
      }

      demande.status = 'approved';
      await demande.save();

      // Générer l'URL du profil
      const profileUrl = `https://connect2card.ci/${demande.userName}`;
      // Générer le QR code à partir de l'URL
      const qrCodeImage = await QRCode.toDataURL(profileUrl);

      // Ajouter l'utilisateur à la collection 'users' - EXACTEMENT comme l'ancien code
      const newUser = new this.userModel({
        userName: demande.userName,
        phoneNumber: demande.phoneNumber,
        password: demande.password, // Déjà hashé
        email: demande.email,
        qrCode: qrCodeImage,
      });

      await newUser.save();

      return {
        message: 'Demande approuvée avec succès',
        qrCode: qrCodeImage,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async rejectDemande(id: string): Promise<{ message: string }> {
    try {
      // Trouver la demande et la rejeter
      const demande = await this.demandeModel.findById(id);

      if (!demande) {
        throw new NotFoundException('Demande non trouvée');
      }

      demande.status = 'rejected';
      await demande.save();

      return { message: 'Demande rejetée avec succès' };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async deleteDemande(id: string): Promise<{ message: string }> {
    try {
      // Supprimer la demande
      const deletedDemande = await this.demandeModel.findByIdAndDelete(id);

      if (!deletedDemande) {
        throw new NotFoundException('Demande non trouvée');
      }

      return { message: 'Demande supprimée avec succès' };
    } catch (error) {
      console.error('Erreur lors de la suppression de la demande :', error);
      throw error;
    }
  }

  private async sendConfirmationEmail(demandeData: any): Promise<void> {
    const mailOptions = {
      from: '"CONNECT TEAM" <support@connect2card.com>',
      to: demandeData.email,
      subject: `Félicitation 🎉 ${demandeData.userName}`,
      html: `
        <h1>Félicitations ${demandeData.userName}!</h1>
        <p>Votre demande de carte a été enregistrée avec succès.</p>
        <p>Nom: ${demandeData.nom}</p>
        <p>Prénom: ${demandeData.prenom}</p>
        <p>Téléphone: ${demandeData.phoneNumber}</p>
        <p>Date: ${demandeData.date}</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
