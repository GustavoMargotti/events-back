import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParticipantesController } from './participantes.controller';
import { ParticipantesService } from './participantes.service';
import { Participante } from '../entities/participante.entity';
import { Evento } from '../entities/evento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Participante, Evento])],
  controllers: [ParticipantesController],
  providers: [ParticipantesService],
})
export class ParticipantesModule {}
