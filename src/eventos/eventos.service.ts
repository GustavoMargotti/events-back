import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from '../entities/evento.entity';
import { LocalEntity } from '../entities/local.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento) private readonly repo: Repository<Evento>,
    @InjectRepository(LocalEntity) private readonly localRepo: Repository<LocalEntity>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateEventoDto): Promise<Evento> {
    // RN1: Evento não pode ser no passado
    const hoje = this.getDateFromBR(this.formatDateBR(new Date()));
    const dataEvento = this.getDateFromBR(dto.data);
    if (dataEvento < hoje) {
      throw new BadRequestException('A data do evento não pode ser no passado');
    }

    // RN2: Duração mínima 00:30 e máxima 23:59
    const [h, m] = dto.duracao.split(':').map(Number);
    const totalMinutos = h * 60 + m;
    if (totalMinutos < 30) {
      throw new BadRequestException('Duração mínima do evento é 00:30');
    }
    if (totalMinutos > 1439) {
      throw new BadRequestException('Duração máxima do evento é 23:59');
    }

    // RN3: Conflito de local na mesma data
    const conflito = await this.repo.findOne({
      where: { localId: dto.localId, data: dto.data },
    });
    if (conflito) {
      throw new BadRequestException(
        `Já existe um evento neste local na data ${dto.data}`,
      );
    }

    // RN15: Nome único por local e data
    const nomeConflito = await this.repo.findOne({
      where: { localId: dto.localId, data: dto.data, nome: dto.nome.trim() },
    });
    if (nomeConflito) {
      throw new BadRequestException(
        `Já existe um evento com o nome "${dto.nome}" neste local na data ${dto.data}`,
      );
    }

    const entity = this.repo.create(dto as Partial<Evento>);
    const saved = await this.repo.save(entity as Evento);
    return saved as Evento;
  }

  async update(id: string, dto: UpdateEventoDto): Promise<Evento> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Evento>) } as Partial<Evento> & { id: string });
    if (!entity) throw new NotFoundException('Evento não encontrado');

    // RN1: Se está atualizando data
    if (dto.data) {
      const hoje = this.getDateFromBR(this.formatDateBR(new Date()));
      const dataEvento = this.getDateFromBR(dto.data);
      if (dataEvento < hoje) {
        throw new BadRequestException('A data do evento não pode ser no passado');
      }
    }

    // RN2: Se está atualizando duração
    if (dto.duracao) {
      const [h, m] = dto.duracao.split(':').map(Number);
      const totalMinutos = h * 60 + m;
      if (totalMinutos < 30) {
        throw new BadRequestException('Duração mínima do evento é 00:30');
      }
      if (totalMinutos > 1439) {
        throw new BadRequestException('Duração máxima do evento é 23:59');
      }
    }

    // RN3 e RN15: Verificar conflito de local/data e nome
    if (dto.localId || dto.data || dto.nome) {
      const localId = dto.localId || entity.localId;
      const data = dto.data || entity.data;
      const nome = dto.nome ? dto.nome.trim() : entity.nome;

      const conflito = await this.repo.findOne({
        where: { localId, data },
      });
      if (conflito && conflito.id !== id) {
        throw new BadRequestException(
          `Já existe um evento neste local na data ${data}`,
        );
      }

      const nomeConflito = await this.repo.findOne({
        where: { localId, data, nome },
      });
      if (nomeConflito && nomeConflito.id !== id) {
        throw new BadRequestException(
          `Já existe um evento com o nome "${nome}" neste local na data ${data}`,
        );
      }
    }

    const saved = await this.repo.save(entity as Evento);
    return saved as Evento;
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Evento não encontrado');
  }

  // Helper para converter DD/MM/AAAA -> Date
  private getDateFromBR(dateStr: string): Date {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  // Helper para formatar Date -> DD/MM/AAAA
  private formatDateBR(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}
