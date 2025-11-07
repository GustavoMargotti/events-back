import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateParticipanteDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @IsString()
  @IsNotEmpty()
  eventoId!: string;
}
