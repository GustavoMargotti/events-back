import { IsEmail, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateOrganizadorDto {
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['coordenacao', 'producao', 'recepcao', 'somluz', 'seguranca'], {
    message: 'Função deve ser uma das opções válidas: coordenacao, producao, recepcao, somluz, seguranca',
  })
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
