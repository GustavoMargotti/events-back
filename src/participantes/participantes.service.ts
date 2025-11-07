import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { Participante } from '../entities/participante.entity';

@Injectable()
export class ParticipantesService {
  constructor(
    @InjectRepository(Participante)
    private readonly repo: Repository<Participante>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateParticipanteDto): Promise<Participante> {
    const entity = this.repo.create(dto as Partial<Participante>);
    const saved = await this.repo.save(entity as Participante);
    return saved as Participante;
  }

  async update(id: string, dto: UpdateParticipanteDto): Promise<Participante> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Participante>) } as Partial<Participante> & { id: string });
    if (!entity) throw new NotFoundException('Participante não encontrado');
    const saved = await this.repo.save(entity as Participante);
    return saved as Participante;
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Participante não encontrado');
  }
}
