import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocalEntity } from '../entities/local.entity';
import { CreateLocalDto } from './dto/create-local.dto';
import { UpdateLocalDto } from './dto/update-local.dto';
import { Evento } from '../entities/evento.entity';

@Injectable()
export class LocaisService {
  constructor(
    @InjectRepository(LocalEntity)
    private readonly repo: Repository<LocalEntity>,
    @InjectRepository(Evento)
    private readonly eventoRepo: Repository<Evento>,
  ) {}

  findAll() {
    return this.repo.find();
  }

  async create(dto: CreateLocalDto): Promise<LocalEntity> {
    // RN14: Campos não podem ser apenas espaços vazios
    if (dto.cidade.trim() === '') {
      throw new BadRequestException('Cidade não pode ser vazia');
    }
    if (dto.bairro.trim() === '') {
      throw new BadRequestException('Bairro não pode ser vazio');
    }
    if (dto.endereco.trim() === '') {
      throw new BadRequestException('Endereço não pode ser vazio');
    }

    const entity = this.repo.create(dto as Partial<LocalEntity>);
    const saved = await this.repo.save(entity as LocalEntity);
    return saved as LocalEntity;
  }

  async update(id: string, dto: UpdateLocalDto): Promise<LocalEntity> {
    const entity = await this.repo.preload({ id, ...(dto as Partial<LocalEntity>) } as Partial<LocalEntity> & { id: string });
    if (!entity) throw new NotFoundException('Local não encontrado');

    // RN14: Validar campos se foram atualizados
    if (dto.cidade !== undefined && dto.cidade.trim() === '') {
      throw new BadRequestException('Cidade não pode ser vazia');
    }
    if (dto.bairro !== undefined && dto.bairro.trim() === '') {
      throw new BadRequestException('Bairro não pode ser vazio');
    }
    if (dto.endereco !== undefined && dto.endereco.trim() === '') {
      throw new BadRequestException('Endereço não pode ser vazio');
    }

    const saved = await this.repo.save(entity as LocalEntity);
    return saved as LocalEntity;
  }

  async remove(id: string): Promise<void> {
    // RN12: Local não pode ser excluído se tiver eventos futuros
    const hoje = this.formatDateBR(new Date());
    const eventos = await this.eventoRepo.find({
      where: { localId: id },
    });

    const eventosFuturos = eventos.filter((ev) => {
      const dataEvento = this.getDateFromBR(ev.data);
      const dataHoje = this.getDateFromBR(hoje);
      return dataEvento >= dataHoje;
    });

    if (eventosFuturos.length > 0) {
      throw new BadRequestException(
        `Não é possível excluir este local pois existem ${eventosFuturos.length} evento(s) futuro(s) vinculado(s)`,
      );
    }

    const res = await this.repo.delete(id);
    if (!res.affected) throw new NotFoundException('Local não encontrado');
  }

  private getDateFromBR(dateStr: string): Date {
    const [d, m, y] = dateStr.split('/').map(Number);
    return new Date(y, m - 1, d);
  }

  private formatDateBR(date: Date): string {
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  }
}
