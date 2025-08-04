import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  ObjectCannedACL,
} from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
  private s3Client: S3Client;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');

    if (!region || !accessKeyId || !secretAccessKey) {
      throw new Error('les credentials aws ne sont pas correctement configurés. Veuillez vérifier vos variables d\'environnement.');
    }

    this.s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET') || '';
  }

  /**
   * Upload un fichier vers S3
   * @param file Buffer du fichier
   * @param filename Nom du fichier
   * @param mimetype Type MIME du fichier
   * @param folder Dossier de destination (optionnel)
   * @returns URL du fichier uploadé
   */
  async uploadFile(
    file: Buffer,
    filename: string,
    mimetype: string,
    folder: string = 'uploads',
  ): Promise<{ url: string; key: string }> {
    try {
      // Générer un nom unique pour éviter les conflits
      const uniqueId = uuidv4();
      const key = `${folder}/${uniqueId}-${filename}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: key,
        Body: file,
        ContentType: mimetype,
        ACL: ObjectCannedACL.public_read,
      };

      await this.s3Client.send(new PutObjectCommand(uploadParams));

      const fileUrl = `https://${this.bucketName}.s3.amazonaws.com/${key}`;

      return {
        url: fileUrl,
        key: key,
      };
    } catch (error) {
      console.error('Erreur lors de l\'upload vers S3:', error);
      throw new HttpException(
        'Erreur lors de l\'upload du fichier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Supprimer un fichier de S3
   * @param key Clé du fichier à supprimer
   */
  async deleteFile(key: string): Promise<void> {
    try {
      const deleteParams = {
        Bucket: this.bucketName,
        Key: key,
      };

      await this.s3Client.send(new DeleteObjectCommand(deleteParams));
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier:', error);
      throw new HttpException(
        'Erreur lors de la suppression du fichier',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Obtenir l'URL publique d'un fichier
   * @param key Clé du fichier
   * @returns URL publique du fichier
   */
  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${key}`;
  }
}
