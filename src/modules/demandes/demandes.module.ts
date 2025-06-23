import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DemandesController } from './demandes.controller';
import { DemandesService } from './demandes.service';
import { Demande, DemandeSchema } from '../../common/schemas/demande.schema';
import { User, UserSchema } from '../../common/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Demande.name, schema: DemandeSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [DemandesController],
  providers: [DemandesService],
  exports: [DemandesService],
})
export class DemandesModule {} 