import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';

interface DemandeData {
  userName: string;
  nom: string;
  prenom: string;
  phoneNumber: string;
  email: string;
  date?: string;
}

interface TemplateData {
  userName: string;
  nom: string;
  prenom: string;
  phone: string;
  email: string;
  date: string;
  support_email: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;
  private gmail_user: string;
  private gmail_pass: string;

  constructor(private configService: ConfigService) {
    this.gmail_user = this.configService.get<string>('GMAIL_USER') || '';
    this.gmail_pass = this.configService.get<string>('GMAIL_APP_PASSWORD') || '';
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Vérifier que les identifiants sont présents
    if (!this.gmail_user || !this.gmail_pass) {
      this.logger.warn(
        "Variables d'environnement email manquantes. Service email désactivé.",
      );
      return;
    }

    // Configuration pour Gmail
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.gmail_user,
        pass: this.gmail_pass,
      },
    });

    // Vérifier la connexion
    this.transporter.verify((error) => {
      if (error) {
        this.logger.error('Erreur de configuration email:', error);
      } else {
        this.logger.log('Serveur email prêt à envoyer des messages');
      }
    });
  }

  private compileTemplate(templateName: string, data: TemplateData): string {
    try {
      // Le service est dans src/services/, le template est dans src/views/
      const templatePath = path.join(
        __dirname,
        '..',
        'views',
        `${templateName}.handlebars`,
      );

      // Vérifier si le fichier existe
      if (!fs.existsSync(templatePath)) {
        throw new Error(
          `Template ${templateName}.handlebars non trouvé dans ${templatePath}`,
        );
      }

      const templateContent = fs.readFileSync(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      this.logger.error(
        `Erreur lors de la compilation du template ${templateName}:`,
        error,
      );
      throw new Error(
        `Impossible de compiler le template ${templateName}: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  async sendEmail(mailOptions: {
    to: string;
    subject: string;
    html: string;
    from?: string;
  }): Promise<void> {
    // Vérifier que le transporteur est initialisé
    if (!this.transporter) {
      this.logger.warn('Service email non configuré. Email non envoyé.');
      return;
    }

    try {
      const options = {
        from: mailOptions.from || `"CONNECT TEAM" <${this.gmail_user}>`,
        to: mailOptions.to,
        subject: mailOptions.subject,
        html: mailOptions.html,
      };

      const info = await this.transporter.sendMail(options);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.log(`Email envoyé: ${info.messageId || 'ID non disponible'}`);
    } catch (error) {
      this.logger.error("Erreur lors de l'envoi de l'email:", error);
      throw new Error(
        `Échec de l'envoi de l'email: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      );
    }
  }

  async sendConfirmationEmail(demandeData: DemandeData): Promise<void> {
    try {
      // Préparer les données pour le template
      const templateData: TemplateData = {
        userName: demandeData.userName,
        nom: demandeData.nom,
        prenom: demandeData.prenom,
        phone: demandeData.phoneNumber,
        email: demandeData.email,
        date: demandeData.date || new Date().toLocaleDateString('fr-FR'),
        support_email: this.gmail_user || 'connnect.lab@gmail.com'
      };

      // Compiler le template Handlebars
      const htmlContent = this.compileTemplate('demande', templateData);

      await this.sendEmail({
        to: demandeData.email,
        subject: `Félicitation 🎉 ${demandeData.userName}`,
        html: htmlContent,
      });
    } catch (error) {
      this.logger.error(
        "Erreur lors de l'envoi de l'email de confirmation:",
        error,
      );
      throw error;
    }
  }
}
