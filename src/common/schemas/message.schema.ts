import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  destinataire: Types.ObjectId;

  @Prop({ required: true, trim: true })
  destinataireUserName: string;

  @Prop({
    type: {
      nom: { type: String, required: true, trim: true },
      contact: { type: String, required: true, trim: true },
    },
    required: true,
  })
  expediteur: {
    nom: string;
    contact: string;
  };

  @Prop({ required: true, trim: true })
  message: string;

  @Prop({
    type: String,
    enum: ['non_lu', 'lu', 'archive'],
    default: 'non_lu',
  })
  statut: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
