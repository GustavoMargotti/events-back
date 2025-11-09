import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
    // RN7: Organizador não pode ter função duplicada no mesmo evento
    const funcaoExiste = await this.repo.findOne({
      where: { eventoId: dto.eventoId, funcao: dto.funcao },
    });
    if (funcaoExiste) {
      throw new BadRequestException(
        `Já existe um organizador com a função "${dto.funcao}" neste evento`,
      );
    }

    // RN8: Email único por evento
    const emailExiste = await this.repo.findOne({
      where: { eventoId: dto.eventoId, email: dto.email.toLowerCase().trim() },
    });
    if (emailExiste) {
      throw new BadRequestException(
        'Este email já está cadastrado como organizador neste evento',
      );
    }

    const entity = this.repo.create(dto as Partial<Organizador>);
    const saved = await this.repo.save(entity as Organizador);
    return saved as Organizador;
  }

  async update(id: string, dto: UpdateOrganizadorDto): Promise<Organizador> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Organizador>) } as Partial<Organizador> & { id: string });
    if (!entity) throw new NotFoundException('Organizador não encontrado');

    // RN7: Função única (se mudou)
    if (dto.funcao) {
      const funcaoExiste = await this.repo.findOne({
        where: { eventoId: entity.eventoId, funcao: dto.funcao },
      });
      if (funcaoExiste && funcaoExiste.id !== id) {
        throw new BadRequestException(
          `Já existe um organizador com a função "${dto.funcao}" neste evento`,
        );
      }
    }

    // RN8: Email único (se mudou)
    if (dto.email) {
      const emailExiste = await this.repo.findOne({
        where: { eventoId: entity.eventoId, email: dto.email.toLowerCase().trim() },
      });
      if (emailExiste && emailExiste.id !== id) {
        throw new BadRequestException(
          'Este email já está cadastrado como organizador neste evento',
        );
      }
    }

    const saved = await this.repo.save(entity as Organizador);
    return saved as Organizador;
  }

  async remove(id: string): Promise<void> {
    // RN9: Evento deve ter pelo menos 1 organizador
    const organizador = await this.repo.findOne({ where: { id } });
    if (!organizador) {
      throw new NotFoundException('Organizador não encontrado');
    }

    const totalOrganizadores = await this.repo.count({
      where: { eventoId: organizador.eventoId },
    });
    if (totalOrganizadores <= 1) {
      throw new BadRequestException(
        'Não é possível excluir o último organizador do evento',
      );
    }

    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Organizador não encontrado');
  }
}
