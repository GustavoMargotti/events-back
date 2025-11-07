import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';
import { Ingresso } from '../entities/ingresso.entity';

@Injectable()
export class IngressosService {
  constructor(
    @InjectRepository(Ingresso) private readonly repo: Repository<Ingresso>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateIngressoDto): Promise<Ingresso> {
    const entity = this.repo.create(dto as Partial<Ingresso>);
    const saved = await this.repo.save(entity as Ingresso);
    return saved as Ingresso;
  }

  async update(id: string, dto: UpdateIngressoDto): Promise<Ingresso> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Ingresso>) } as Partial<Ingresso> & { id: string });
    if (!entity) throw new NotFoundException('Ingresso não encontrado');
    const saved = await this.repo.save(entity as Ingresso);
    return saved as Ingresso;
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Ingresso não encontrado');
  }
}
