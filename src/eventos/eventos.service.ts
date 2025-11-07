import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Evento } from '../entities/evento.entity';

@Injectable()
export class EventosService {
  constructor(
    @InjectRepository(Evento) private readonly repo: Repository<Evento>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateEventoDto): Promise<Evento> {
    const entity = this.repo.create(dto as Partial<Evento>);
    const saved = await this.repo.save(entity as Evento);
    return saved as Evento;
  }

  async update(id: string, dto: UpdateEventoDto): Promise<Evento> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Evento>) } as Partial<Evento> & { id: string });
    if (!entity) throw new NotFoundException('Evento não encontrado');
    const saved = await this.repo.save(entity as Evento);
    return saved as Evento;
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Evento não encontrado');
  }
}
