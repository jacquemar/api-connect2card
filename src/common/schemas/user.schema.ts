import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true, unique: true, trim: true })
  userName: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ default: '' })
  mail: string;

  @Prop({ required: true })
  password: string;

  @Prop({ default: '' })
  photoProfilURL: string;

  @Prop({ default: '' })
  banniereURL: string;

  @Prop({ default: '' })
  nomComplet: string;

  @Prop({ default: '' })
  titre: string;

  @Prop({ default: '' })
  phoneNumber: string;

  @Prop({ default: '' })
  facebook: string;

  @Prop({ default: '' })
  instagram: string;

  @Prop({ default: '' })
  snapchat: string;

  @Prop({ default: '' })
  youtube: string;

  @Prop({ default: '' })
  tiktok: string;

  @Prop({ default: '' })
  twitter: string;

  @Prop({ default: '' })
  whatsapp: string;

  @Prop({ default: '' })
  pinterest: string;

  @Prop({ default: '' })
  linkedin: string;

  @Prop({ default: '' })
  behance: string;

  @Prop({ default: '' })
  telegram: string;

  @Prop({ default: '' })
  web: string;

  @Prop({ default: '' })
  googleReview: string;

  @Prop({ default: '' })
  tripadvisor: string;

  @Prop({ default: '' })
  service1: string;

  @Prop({ default: '' })
  service2: string;

  @Prop({ default: '' })
  service3: string;

  @Prop({ default: '' })
  service4: string;

  @Prop({ default: false })
  isLocationEnabled: boolean;

  @Prop({ default: null })
  latitude: number;

  @Prop({ default: null })
  longitude: number;

  @Prop({ default: '' })
  address: string;

  @Prop({ default: 0 })
  visitscount: number;

  @Prop({ default: 0 })
  vcardDownloadsCount: number;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: '1' })
  level: string;

  @Prop({ default: 'bronze' })
  profil: string;

  @Prop()
  qrCode: string;

  @Prop({ default: 100 })
  credit: number;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isSuspended: boolean;

  @Prop([
    {
      date: { type: Date, default: Date.now },
      count: { type: Number, default: 1 },
    },
  ])
  visitsHistory: Array<{ date: Date; count: number }>;

  @Prop()
  resetPasswordToken: string;

  @Prop()
  resetPasswordExpires: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
