# Events API (Backend)

API REST para gestão de eventos, locais, ingressos, organizadores e participantes.

## 🧱 Modelo de Dados (simplificado)
- Evento: { id, nome, data (DD/MM/AAAA), duracao (hh:mm), localId }
- Local: { id, nome, cidade, bairro, endereco, capacidade }
- Ingresso: { id, nome, preco (number), quantidade, vendaAtiva, eventoId }
- Organizador: { id, nome, funcao, email, telefone, eventoId }
- Participante: { id, nome, email, telefone, eventoId }

## 🧠 Regras de Negócio (15)
1. Evento não pode ser criado/editado com data no passado  
2. Duração mínima 00:30 e máxima 23:59  
3. Um local não pode ter dois eventos na mesma data  
4. Soma das quantidades de ingressos de um evento não pode exceder a capacidade do local  
5. Nome de tipo de ingresso deve ser único por evento  
6. Não é permitido excluir o último tipo de ingresso de um evento  
7. Função de organizador única por evento (sem duplicar mesma função)  
8. Email de organizador único por evento  
9. Não excluir o último organizador do evento  
10. Participante: email único por evento  
11. Total de participantes não pode exceder capacidade do local  
12. Local não pode ser excluído se houver eventos futuros vinculados  
13. Preço de ingresso deve ser > 0  
14. Campos de endereço (cidade, bairro, endereço) não podem ser apenas espaços  
15. Nome de evento deve ser único dentro do mesmo local na mesma data  

Todas retornam HTTP 400 (`BadRequestException`) ou 404 (`NotFoundException`) conforme o caso.

## 🗄️ Variáveis de Ambiente (.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=events
PORT=3000
```