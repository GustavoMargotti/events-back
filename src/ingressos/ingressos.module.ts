import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngressosController } from './ingressos.controller';
import { IngressosService } from './ingressos.service';
import { Ingresso } from '../entities/ingresso.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ingresso])],
  controllers: [IngressosController],
  providers: [IngressosService],
})
export class IngressosModule {}
