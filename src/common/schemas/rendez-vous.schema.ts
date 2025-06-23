import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RendezVousDocument = RendezVous & Document;

@Schema({ timestamps: true })
export class RendezVous {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  utilisateur: Types.ObjectId;

  @Prop({ required: true, trim: true })
  utilisateurUserName: string;

  @Prop({ required: true })
  date: Date;

  @Prop({ required: true, trim: true })
  heure: string;

  @Prop({
    type: {
      nom: { type: String, required: true, trim: true },
      telephone: { type: String, required: true, trim: true },
      motif: { type: String, required: true, trim: true }
    },
    required: true
  })
  demandeur: {
    nom: string;
    telephone: string;
    motif: string;
  };

  @Prop({ 
    type: String, 
    enum: ['en_attente', 'confirme', 'annule', 'termine'], 
    default: 'en_attente' 
  })
  statut: string;
}

export const RendezVousSchema = SchemaFactory.createForClass(RendezVous); 