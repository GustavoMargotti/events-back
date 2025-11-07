import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
} from 'class-validator';

export class CreateIngressoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsNumber()
  @Min(0)
  preco!: number;

  @IsNumber()
  @Min(0)
  quantidade!: number;

  @IsBoolean()
  vendaAtiva!: boolean;

  @IsString()
  @IsNotEmpty()
  eventoId!: string;
}
