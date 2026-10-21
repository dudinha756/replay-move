# Mood → Movement

Mood → Movement é um MVP de bem-estar para pessoas que têm dificuldade de começar a se movimentar.

## Proposta
O usuário informa:
- como está se sentindo;
- seu nível de energia;
- como gostaria de terminar a sessão;
- onde consegue se mover;
- intensidade possível;
- se música ajuda;
- quanto tempo realmente tem.

O app reduz a fricção da escolha e entrega **uma sessão concreta**, com roteiro, duração e opção de música.

## Biblioteca atual
A biblioteca inclui movimentos e práticas inspirados nas categorias suportadas pelo Garmin vívoactive 6, sem alegar integração com o relógio:
- caminhada;
- mobilidade;
- força;
- HIIT;
- yoga;
- Pilates;
- respiração;
- meditação;
- dança livre;
- rotina leve para desacelerar.

## Força e funcional
Os circuitos usam padrões fundamentais e versões acessíveis:
- agachamento / sentar e levantar;
- flexão adaptada;
- ponte de glúteos;
- avanço reverso;
- prancha ou dead bug;
- bird dog e exercícios de estabilidade.

## Música sem OAuth
O MVP não acessa dados privados do Spotify. Quando o usuário quer música, o app abre uma busca pronta no Spotify coerente com o objetivo e o tipo de sessão.

## Personalização
A primeira versão usa regras transparentes e o histórico local de feedback pós-sessão ("melhor", "igual", "pior"). O objetivo é aprender quais contextos e movimentos parecem funcionar melhor para cada usuário sem fazer afirmações clínicas.

## Segurança
O produto é uma ferramenta de bem-estar e apoio à decisão. Não oferece diagnóstico, tratamento, reabilitação ou prescrição médica.

## Rodar
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
```


## Sessões longas e musculação

O seletor de tempo agora aceita 5, 10, 20, 30, 45, 60, 90 e 120 minutos.

A biblioteca inclui, além das práticas curtas:
- treino de academia para glúteos e posteriores;
- treino de ombro, tríceps e peito;
- treino de quadríceps e glúteos;
- treino de costas e bíceps;
- cardio endurance de 45–120 min;
- cardio intervalado avançado;
- HIIT, corrida/caminhada, força, mobilidade, Pilates, yoga, respiração e meditação.

Os modelos de musculação diferenciam sessões de 60, 90 e 120 minutos e priorizam padrões multiarticulares antes de exercícios acessórios quando apropriado. Sessões longas não são automaticamente tratadas como mais intensas.

## Spotify

No MVP atual, música continua sendo um gatilho opcional: o app abre uma busca coerente no Spotify sem exigir login externo. A criação automática de playlists na conta do usuário fica para uma fase futura porque a Web API do Spotify exige OAuth e autorização do usuário.
