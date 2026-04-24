import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema()
export class Otp {
  @Prop({ required: true, index: true })
  email: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ required: true, enum: ['registration', 'forgot-password'] })
  type: string;

  @Prop({ type: Object })
  userData?: any;

  @Prop({ default: Date.now, expires: 600 }) // TTL: 10 minutes
  createdAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
