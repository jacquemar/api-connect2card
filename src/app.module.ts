import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DemandesModule } from './modules/demandes/demandes.module';
import { AppointmentsModule } from './modules/appointments/appointments.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RendezVousModule } from './modules/rendez-vous/rendez-vous.module';
import { GeoReverseModule } from './geo-reverse/geo-reverse.module';
import { S3Module } from './services/s3.module';
import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri:
          configService.get<string>('MONGODB_URI') ||
          'mongodb://localhost:27017/ConnectDb',
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET');
        if (!secret) {
          throw new Error(
            "JWT_SECRET doit être défini dans les variables d'environnement",
          );
        }
        return {
          secret,
          signOptions: {
            expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d',
            algorithm: 'HS256',
            issuer: 'connect2card-api',
            audience: 'connect2card-client',
            // Ajout d'un jitter aléatoire pour éviter les collisions de tokens
            jwtid: Math.random().toString(36).substring(7),
          },
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DemandesModule,
    AppointmentsModule,
    MessagesModule,
    RendezVousModule,
    GeoReverseModule,
    S3Module,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
