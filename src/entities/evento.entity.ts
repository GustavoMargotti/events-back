import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { LocalEntity } from './local.entity';
import { Ingresso } from './ingresso.entity';
import { Organizador } from './organizador.entity';
import { Participante } from './participante.entity';

@Entity('eventos')
export class Evento {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({ type: 'varchar', length: 10 })
  data!: string; // DD/MM/AAAA

  @Column({ type: 'varchar', length: 5 })
  duracao!: string; // hh:mm

  @Column({ type: 'uuid' })
  localId!: string;

  @ManyToOne(() => LocalEntity, (l) => l.eventos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'localId' })
  local?: LocalEntity;

  @OneToMany(() => Ingresso, (i) => i.evento)
  ingressos?: Ingresso[];

  @OneToMany(() => Organizador, (o) => o.evento)
  organizadores?: Organizador[];

  @OneToMany(() => Participante, (p) => p.evento)
  participantes?: Participante[];
}
