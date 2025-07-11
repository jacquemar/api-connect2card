import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RendezVousController } from './rendez-vous.controller';
import { RendezVousService } from './rendez-vous.service';
import { RendezVous, RendezVousSchema } from '../../common/schemas/rendez-vous.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RendezVous.name, schema: RendezVousSchema },
    ]),
  ],
  controllers: [RendezVousController],
  providers: [RendezVousService],
  exports: [RendezVousService],
})
export class RendezVousModule {} 