import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { Evento } from './evento.entity';

@Entity('ingressos')
export class Ingresso {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  preco!: number;

  @Column({ type: 'int' })
  quantidade!: number;

  @Column({ type: 'boolean' })
  vendaAtiva!: boolean;

  @Column({ type: 'uuid' })
  eventoId!: string;

  @ManyToOne(() => Evento, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'eventoId' })
  evento?: Evento;
}
