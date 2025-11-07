import {
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateLocalDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Cidade muito curta' })
  cidade!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2, { message: 'Bairro muito curto' })
  bairro!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(5, { message: 'Endereço muito curto' })
  endereco!: string;

  @IsNumber()
  @Min(0)
  capacidade!: number;
}
