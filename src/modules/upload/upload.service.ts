import { Injectable, BadRequestException } from '@nestjs/common';
import { S3Service } from '../../services/s3.service';

@Injectable()
export class UploadService {
  constructor(private readonly s3Service: S3Service) {}

  /**
   * Upload une bannière
   */
  async uploadBanniere(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      const result = await this.s3Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'banners',
      );

      return { url: result.url };
    } catch (error) {
      console.error('Erreur lors du téléchargement de la bannière:', error);
      throw new BadRequestException('Erreur lors du téléchargement de la bannière');
    }
  }

  /**
   * Upload une photo de profil
   */
  async uploadPhotoProfil(file: Express.Multer.File): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      const result = await this.s3Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        'profiles',
      );

      return { url: result.url };
    } catch (error) {
      console.error('Erreur lors du téléchargement de la photo de profil:', error);
      throw new BadRequestException('Erreur lors du téléchargement de la photo de profil');
    }
  }

  /**
   * Upload une image générique
   */
  async uploadImage(file: Express.Multer.File, folder: string = 'images'): Promise<{ url: string }> {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    try {
      const result = await this.s3Service.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        folder,
      );

      return { url: result.url };
    } catch (error) {
      console.error('Erreur lors du téléchargement de l\'image:', error);
      throw new BadRequestException('Erreur lors du téléchargement de l\'image');
    }
  }
}
