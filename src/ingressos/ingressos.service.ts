import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIngressoDto } from './dto/create-ingresso.dto';
import { UpdateIngressoDto } from './dto/update-ingresso.dto';
import { Ingresso } from '../entities/ingresso.entity';
import { Evento } from '../entities/evento.entity';

@Injectable()
export class IngressosService {
  constructor(
    @InjectRepository(Ingresso) private readonly repo: Repository<Ingresso>,
    @InjectRepository(Evento) private readonly eventoRepo: Repository<Evento>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateIngressoDto): Promise<Ingresso> {
    // RN13: Preço deve ser maior que zero
    if (dto.preco <= 0) {
      throw new BadRequestException('O preço do ingresso deve ser maior que zero');
    }

    // Buscar evento com local
    const evento = await this.eventoRepo.findOne({
      where: { id: dto.eventoId },
      relations: ['local'],
    });
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    // RN5: Nome de ingresso único por evento
    const nomeExiste = await this.repo.findOne({
      where: { eventoId: dto.eventoId, nome: dto.nome.trim() },
    });
    if (nomeExiste) {
      throw new BadRequestException(
        `Já existe um tipo de ingresso "${dto.nome}" neste evento`,
      );
    }

    // RN4: Total de ingressos não pode exceder capacidade do local
    const ingressosExistentes = await this.repo.find({
      where: { eventoId: dto.eventoId },
    });
    const totalExistente = ingressosExistentes.reduce(
      (sum, i) => sum + i.quantidade,
      0,
    );
    const novoTotal = totalExistente + dto.quantidade;

    if (novoTotal > evento.local!.capacidade) {
      throw new BadRequestException(
        `Total de ingressos (${novoTotal}) excede a capacidade do local (${evento.local!.capacidade})`,
      );
    }

    const entity = this.repo.create(dto as Partial<Ingresso>);
    const saved = await this.repo.save(entity as Ingresso);
    return saved as Ingresso;
  }

  async update(id: string, dto: UpdateIngressoDto): Promise<Ingresso> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Ingresso>) } as Partial<Ingresso> & { id: string });
    if (!entity) throw new NotFoundException('Ingresso não encontrado');

    // RN13: Preço deve ser maior que zero
    if (dto.preco !== undefined && dto.preco <= 0) {
      throw new BadRequestException('O preço do ingresso deve ser maior que zero');
    }

    // RN5: Nome único por evento (se mudou o nome)
    if (dto.nome) {
      const nomeExiste = await this.repo.findOne({
        where: { eventoId: entity.eventoId, nome: dto.nome.trim() },
      });
      if (nomeExiste && nomeExiste.id !== id) {
        throw new BadRequestException(
          `Já existe um tipo de ingresso "${dto.nome}" neste evento`,
        );
      }
    }

    // RN4: Verificar capacidade (se mudou quantidade)
    if (dto.quantidade !== undefined) {
      const evento = await this.eventoRepo.findOne({
        where: { id: entity.eventoId },
        relations: ['local'],
      });
      if (!evento) {
        throw new NotFoundException('Evento não encontrado');
      }

      const ingressosExistentes = await this.repo.find({
        where: { eventoId: entity.eventoId },
      });
      const totalExistente = ingressosExistentes
        .filter((i) => i.id !== id)
        .reduce((sum, i) => sum + i.quantidade, 0);
      const novoTotal = totalExistente + dto.quantidade;

      if (novoTotal > evento.local!.capacidade) {
        throw new BadRequestException(
          `Total de ingressos (${novoTotal}) excede a capacidade do local (${evento.local!.capacidade})`,
        );
      }
    }

    const saved = await this.repo.save(entity as Ingresso);
    return saved as Ingresso;
  }

  async remove(id: string): Promise<void> {
    // RN6: Evento deve ter pelo menos 1 tipo de ingresso
    const ingresso = await this.repo.findOne({ where: { id } });
    if (!ingresso) {
      throw new NotFoundException('Ingresso não encontrado');
    }

    const totalIngressos = await this.repo.count({
      where: { eventoId: ingresso.eventoId },
    });
    if (totalIngressos <= 1) {
      throw new BadRequestException(
        'Não é possível excluir o último tipo de ingresso do evento',
      );
    }

    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Ingresso não encontrado');
  }
}
