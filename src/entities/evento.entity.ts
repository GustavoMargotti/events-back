import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { LocalEntity } from './local.entity';

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
}
