import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantesController } from './participantes.controller';
import { ParticipantesService } from './participantes.service';
import { Participante } from '../entities/participante.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participante])],
  controllers: [ParticipantesController],
  providers: [ParticipantesService],
})
export class ParticipantesModule {}
