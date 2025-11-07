import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalEntity } from '../entities/local.entity';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';

@Injectable()
export class LocaisService {
  constructor(
    @InjectRepository(LocalEntity)
    private readonly repo: Repository<LocalEntity>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateLocalDto): Promise<LocalEntity> {
    const entity = this.repo.create(dto as Partial<LocalEntity>);
    const saved = await this.repo.save(entity as LocalEntity);
    return saved as LocalEntity;
  }

  async update(id: string, dto: UpdateLocalDto): Promise<LocalEntity> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<LocalEntity>) } as Partial<LocalEntity> & { id: string });
    if (!entity) throw new NotFoundException('Local não encontrado');
    const saved = await this.repo.save(entity as LocalEntity);
    return saved as LocalEntity;
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Local não encontrado');
  }
}
