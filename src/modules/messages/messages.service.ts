import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../common/schemas/user.schema';
import { Message, MessageDocument } from '../../common/schemas/message.schema';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
  ) {}

  async createMessage(createMessageDto: any): Promise<any> {
    try {
      const { destinataireUserName, expediteur, message } = createMessageDto;

      // Vérifier que l'utilisateur destinataire existe
      const utilisateur = await this.userModel.findOne({ userName: destinataireUserName });

      if (!utilisateur) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Créer le message
      const nouveauMessage = new this.messageModel({
        destinataire: utilisateur._id,
        destinataireUserName: destinataireUserName,
        expediteur: {
          nom: expediteur.nom,
          contact: expediteur.contact,
        },
        message: message,
      });

      // Sauvegarder le message
      await nouveauMessage.save();

      return {
        message: 'Message envoyé avec succès',
        messageData: nouveauMessage,
      };
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      throw error;
    }
  }

  async getMessagesByUser(userName: string, statut?: string): Promise<any[]> {
    try {
      // Vérifier que l'utilisateur existe
      const utilisateur = await this.userModel.findOne({ userName });

      if (!utilisateur) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Construire la requête et récupérer les messages
      let query: any = { destinataire: utilisateur._id };
      if (statut) {
        query.statut = statut;
      }

      const messages = await this.messageModel.find(query)
        .sort({ createdAt: -1 })
        .populate('destinataire', 'nomComplet userName');

      return messages;
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  async updateMessageStatus(id: string, statut: string): Promise<any> {
    try {
      // Mettre à jour le statut du message
      const message = await this.messageModel.findByIdAndUpdate(
        id,
        { statut: statut },
        { new: true }
      );

      if (!message) {
        throw new NotFoundException('Message non trouvé');
      }

      return {
        message: 'Statut du message mis à jour avec succès',
        messageData: message
      };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      throw error;
    }
  }
}
