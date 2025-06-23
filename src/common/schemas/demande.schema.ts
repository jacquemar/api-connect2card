import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DemandeDocument = Demande & Document;

@Schema()
export class Demande {
  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  email: string;

  @Prop({ default: '' })
  nom: string;

  @Prop({ default: '' })
  prenom: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop({ required: true })
  password: string;

  @Prop({ 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  })
  status: string;

  @Prop({ required: true })
  date: string;
}

export const DemandeSchema = SchemaFactory.createForClass(Demande); 