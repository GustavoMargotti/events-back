import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrganizadoresController } from './organizadores.controller';
import { OrganizadoresService } from './organizadores.service';
import { Organizador } from '../entities/organizador.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Organizador])],
  controllers: [OrganizadoresController],
  providers: [OrganizadoresService],
})
export class OrganizadoresModule {}
