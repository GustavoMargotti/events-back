import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateOrganizadorDto } from './dto/create-organizador.dto';
import { UpdateOrganizadorDto } from './dto/update-organizador.dto';
import { Organizador } from '../entities/organizador.entity';

@Injectable()
export class OrganizadoresService {
  constructor(
    @InjectRepository(Organizador)
    private readonly repo: Repository<Organizador>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateOrganizadorDto): Promise<Organizador> {
    const entity = this.repo.create(dto as Partial<Organizador>);
    const saved = await this.repo.save(entity as Organizador);
    return saved as Organizador;
  }

  async update(id: string, dto: UpdateOrganizadorDto): Promise<Organizador> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Organizador>) } as Partial<Organizador> & { id: string });
    if (!entity) throw new NotFoundException('Organizador não encontrado');
    const saved = await this.repo.save(entity as Organizador);
    return saved as Organizador;
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Organizador não encontrado');
  }
}
