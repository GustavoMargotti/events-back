import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CreateEventoDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}\/\d{2}\/\d{4}$/, { message: 'Data deve estar no formato DD/MM/AAAA' })
  data!: string; // DD/MM/AAAA

  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Duração deve estar no formato hh:mm (ex: 02:30)' })
  duracao!: string; // hh:mm

  @IsString()
  @IsNotEmpty()
  localId!: string;
}
