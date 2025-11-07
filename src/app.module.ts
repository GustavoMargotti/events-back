import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DbModule } from './db/db.module';
import { LocaisModule } from './locais/locais.module';
import { EventosModule } from './eventos/eventos.module';
import { OrganizadoresModule } from './organizadores/organizadores.module';
import { ParticipantesModule } from './participantes/participantes.module';
import { IngressosModule } from './ingressos/ingressos.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalEntity } from './entities/local.entity';
import { Evento } from './entities/evento.entity';
import { Organizador } from './entities/organizador.entity';
import { Participante } from './entities/participante.entity';
import { Ingresso } from './entities/ingresso.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'postgres',
        host: cfg.get('DB_HOST', 'localhost'),
        port: parseInt(cfg.get('DB_PORT', '5432'), 10),
        username: cfg.get('DB_USER', 'postgres'),
        password: cfg.get('DB_PASS', 'postgres'),
        database: cfg.get('DB_NAME', 'events'),
        synchronize: true, // dev only
        entities: [LocalEntity, Evento, Organizador, Participante, Ingresso],
      }),
    }),
    DbModule,
    LocaisModule,
    EventosModule,
    OrganizadoresModule,
    ParticipantesModule,
    IngressosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
