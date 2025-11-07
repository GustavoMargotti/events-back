import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('locais')
export class LocalEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  nome!: string;

  @Column({ type: 'varchar', length: 255 })
  cidade!: string;

  @Column({ type: 'varchar', length: 255 })
  bairro!: string;

  @Column({ type: 'varchar', length: 255 })
  endereco!: string;

  @Column({ type: 'int' })
  capacidade!: number;

  @OneToMany('Evento', 'local')
  eventos?: any[];
}
