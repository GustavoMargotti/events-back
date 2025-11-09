import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateParticipanteDto } from './dto/create-participante.dto';
import { UpdateParticipanteDto } from './dto/update-participante.dto';
import { Participante } from '../entities/participante.entity';
import { Evento } from '../entities/evento.entity';

@Injectable()
export class ParticipantesService {
  constructor(
    @InjectRepository(Participante)
    private readonly repo: Repository<Participante>,
    @InjectRepository(Evento)
    private readonly eventoRepo: Repository<Evento>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateParticipanteDto): Promise<Participante> {
    // RN10: Participante não pode se inscrever 2x (email único por evento)
    const emailExiste = await this.repo.findOne({
      where: { eventoId: dto.eventoId, email: dto.email.toLowerCase().trim() },
    });
    if (emailExiste) {
      throw new BadRequestException(
        'Este email já está inscrito neste evento',
      );
    }

    // RN11: Limite de participantes = capacidade do local
    const evento = await this.eventoRepo.findOne({
      where: { id: dto.eventoId },
      relations: ['local'],
    });
    if (!evento) {
      throw new NotFoundException('Evento não encontrado');
    }

    const totalParticipantes = await this.repo.count({
      where: { eventoId: dto.eventoId },
    });

    if (totalParticipantes >= evento.local!.capacidade) {
      throw new BadRequestException(
        `Número máximo de participantes atingido (${evento.local!.capacidade})`,
      );
    }

    const entity = this.repo.create(dto as Partial<Participante>);
    const saved = await this.repo.save(entity as Participante);
    return saved as Participante;
  }

  async update(id: string, dto: UpdateParticipanteDto): Promise<Participante> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<Participante>) } as Partial<Participante> & { id: string });
    if (!entity) throw new NotFoundException('Participante não encontrado');

    // RN10: Email único (se mudou)
    if (dto.email) {
      const emailExiste = await this.repo.findOne({
        where: { eventoId: entity.eventoId, email: dto.email.toLowerCase().trim() },
      });
      if (emailExiste && emailExiste.id !== id) {
        throw new BadRequestException(
          'Este email já está inscrito neste evento',
        );
      }
    }

    const saved = await this.repo.save(entity as Participante);
    return saved as Participante;
  }

  async remove(id: string): Promise<void> {
    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Participante não encontrado');
  }
}
