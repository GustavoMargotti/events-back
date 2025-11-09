import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocaisController } from './locais.controller';
import { LocaisService } from './locais.service';
import { LocalEntity } from '../entities/local.entity';
import { Evento } from '../entities/evento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocalEntity, Evento])],
  controllers: [LocaisController],
  providers: [LocaisService],
})
export class LocaisModule {}
