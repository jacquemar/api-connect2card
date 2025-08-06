import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

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
      this.logger.warn('Variables d\'environnement email manquantes. Service email désactivé.');
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
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Erreur de configuration email:', error);
      } else {
        this.logger.log('Serveur email prêt à envoyer des messages');
      }
    });
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
      this.logger.log(`Email envoyé: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
    }
  }

  async sendConfirmationEmail(demandeData: any): Promise<void> {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">🎉 Félicitations ${demandeData.userName}!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Votre demande de carte a été enregistrée avec succès. Notre équipe va examiner votre demande et vous contactera bientôt.
          </p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #495057; margin-top: 0;">📋 Détails de votre demande:</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #495057;">Nom:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${demandeData.nom}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #495057;">Prénom:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${demandeData.prenom}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #495057;">Nom d'utilisateur:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${demandeData.userName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #495057;">Téléphone:</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #333;">${demandeData.phoneNumber}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #495057;">Date:</td>
                <td style="padding: 8px 0; color: #333;">${demandeData.date}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #6c757d; text-align: center; margin-top: 30px;">
            Merci de votre confiance en Connect2Card! 🚀
          </p>
        </div>
      </div>
    `;

    await this.sendEmail({
      to: demandeData.email,
      subject: `Félicitation 🎉 ${demandeData.userName}`,
      html: htmlContent,
    });
  }
}
