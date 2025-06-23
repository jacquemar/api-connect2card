import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AppointmentDocument = Appointment & Document;

@Schema({ timestamps: true })
export class Appointment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  profileOwner: Types.ObjectId;

  @Prop({ required: true })
  userName: string;

  @Prop({ required: true })
  userPhone: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: true })
  time: string;

  @Prop()
  message: string;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment); 