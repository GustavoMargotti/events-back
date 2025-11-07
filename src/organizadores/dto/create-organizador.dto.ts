import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizadorDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  funcao!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @IsString()
  @IsNotEmpty()
  eventoId!: string;
}
