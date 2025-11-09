import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosController } from './eventos.controller';
import { EventosService } from './eventos.service';
import { Evento } from '../entities/evento.entity';
import { LocalEntity } from '../entities/local.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Evento, LocalEntity])],
  controllers: [EventosController],
  providers: [EventosService],
})
export class EventosModule {}
