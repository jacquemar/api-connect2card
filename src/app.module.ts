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
// Modules temporairement désactivés - à créer si nécessaire
// import { RendezVousModule } from './modules/rendez-vous/rendez-vous.module';
// import { MessagesModule } from './modules/messages/messages.module';
// import { UploadModule } from './modules/upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI') || 'mongodb+srv://jacquemar:o85pxev28Rl0qapG@ConnectDb.mht5fkp.mongodb.net/ConnectDb?retryWrites=true&writeConcern=majority',
      }),
      inject: [ConfigService],
    }),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'secret secours',
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN') || '7d' 
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DemandesModule,
    AppointmentsModule,
    // RendezVousModule,
    // MessagesModule, 
    // UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
