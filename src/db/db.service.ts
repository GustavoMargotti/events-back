import { Injectable, Logger } from '@nestjs/common';
import { promises as fs } from 'fs';
import * as path from 'path';

export type Id = string;

export interface Local {
  id: Id;
  nome: string;
  cidade?: string | null;
  bairro?: string | null;
  endereco?: string | null;
  capacidade: number;
}

export interface Evento {
  id: Id;
  nome: string;
  data: string; // DD/MM/AAAA
  duracao: string;
  preco: number;
  localId: Id;
}

export interface Participante {
  id: Id;
  nome: string;
  email: string;
  telefone: string;
  eventoId: Id;
}

export interface Organizador {
  id: Id;
  nome: string;
  funcao: string;
  email: string;
  telefone: string;
  eventoId: Id;
}

export interface Ingresso {
  id: Id;
  nome: string;
  preco: number;
  quantidade: number;
  vendaAtiva: boolean;
  eventoId: Id;
}

export interface DatabaseSchema {
  locais: Local[];
  eventos: Evento[];
  participantes: Participante[];
  organizadores: Organizador[];
  ingressos: Ingresso[];
}

type EntityOf<K extends keyof DatabaseSchema> = DatabaseSchema[K][number];

@Injectable()
export class DbService {
  private readonly logger = new Logger(DbService.name);
  private dbPath: string;
  private data: DatabaseSchema | null = null;

  constructor() {
    // Store under project root /data/db.json
    this.dbPath = path.resolve(process.cwd(), 'data', 'db.json');
  }

  private async ensureLoaded() {
    if (this.data) return;
    try {
      await fs.mkdir(path.dirname(this.dbPath), { recursive: true });
      const content = await fs.readFile(this.dbPath, 'utf8').catch(async () => {
        const initial: DatabaseSchema = {
          locais: [],
          eventos: [],
          participantes: [],
          organizadores: [],
          ingressos: [],
        };
        await fs.writeFile(
          this.dbPath,
          JSON.stringify(initial, null, 2),
          'utf8',
        );
        return JSON.stringify(initial);
      });
      this.data = JSON.parse(content) as DatabaseSchema;
    } catch (err) {
      this.logger.error('Failed to load DB file', err);
      // fallback in-memory empty database
      this.data = {
        locais: [],
        eventos: [],
        participantes: [],
        organizadores: [],
        ingressos: [],
      };
    }
  }

  private async persist() {
    if (!this.data) return;
    try {
      await fs.writeFile(
        this.dbPath,
        JSON.stringify(this.data, null, 2),
        'utf8',
      );
    } catch (err) {
      this.logger.error('Failed to persist DB file', err);
    }
  }

  private genId(): Id {
    // Generate a short 4-hex id; ensure low collision by retrying
    const hex = () =>
      Math.floor(Math.random() * 0xffff)
        .toString(16)
        .padStart(4, '0');
    return hex();
  }

  // Generic helpers
  async getAll<K extends keyof DatabaseSchema>(
    collection: K,
  ): Promise<DatabaseSchema[K]> {
    await this.ensureLoaded();
    return (this.data as DatabaseSchema)[collection];
  }

  async getById<K extends keyof DatabaseSchema>(
    collection: K,
    id: Id,
  ): Promise<EntityOf<K> | undefined> {
    const list = (await this.getAll(collection)) as Array<EntityOf<K>>;
    return list.find((i) => i.id === id);
  }

  async create<K extends keyof DatabaseSchema, T extends EntityOf<K>>(
    collection: K,
    payload: Omit<T, 'id'> & Partial<Pick<T, 'id'>>,
  ): Promise<T> {
    await this.ensureLoaded();
    const list = (this.data as DatabaseSchema)[collection] as Array<T>;
    const id: Id = (payload as Partial<Pick<T, 'id'>>).id ?? this.genId();
    const entity = { ...(payload as Omit<T, 'id'>), id } as T;
    list.push(entity);
    await this.persist();
    return entity;
  }

  async update<K extends keyof DatabaseSchema, T extends EntityOf<K>>(
    collection: K,
    id: Id,
    payload: Partial<T>,
  ): Promise<T | undefined> {
    await this.ensureLoaded();
    const list = (this.data as DatabaseSchema)[collection] as Array<T>;
    const idx = list.findIndex((i) => i.id === id);
    if (idx === -1) return undefined;
    const updated = { ...list[idx], ...payload, id } as T;
    list[idx] = updated;
    await this.persist();
    return updated;
  }

  async remove<K extends keyof DatabaseSchema>(
    collection: K,
    id: Id,
  ): Promise<boolean> {
    await this.ensureLoaded();
    const list = (this.data as DatabaseSchema)[collection] as Array<
      EntityOf<K>
    >;
    const before = list.length;
    const filtered = list.filter((i) => i.id !== id);
    (this.data as DatabaseSchema)[collection] = filtered as DatabaseSchema[K];
    const changed = filtered.length !== before;
    if (changed) await this.persist();
    return changed;
  }
}
