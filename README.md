# Mood → Movement

Mood → Movement é um aplicativo de bem-estar para pessoas que têm dificuldade de começar a se movimentar.

## O que o app faz
O usuário informa:
- estado atual;
- nível de energia;
- intenção para a sessão;
- ambiente;
- intensidade possível;
- se música ajuda;
- tempo disponível.

O app entrega uma única sessão concreta, reduzindo a fricção de decisão.

## Biblioteca de movimento
A biblioteca inclui:
- caminhada;
- mobilidade;
- força com peso do corpo;
- HIIT;
- yoga;
- Pilates;
- respiração;
- meditação;
- dança;
- desaceleração.

Algumas categorias foram inspiradas na amplitude de atividades do Garmin vívoactive 6, mas o usuário não precisa ter Garmin.

## Música
A música é apenas um gatilho opcional. Não existe perfil musical, OAuth ou criação de playlists. Quando o usuário quer música, o app abre uma busca coerente com a sessão no Spotify.

## Preparação alimentar
A aba de alimentação oferece educação nutricional geral baseada em:
- tipo de sessão;
- duração;
- intensidade;
- objetivo (energia, ganho de massa, definição ou bem-estar).

Ela não prescreve dieta individual e não substitui nutricionista.

## Garmin opcional
O app possui uma área preparada para integração com Garmin Connect. A integração oficial depende de credenciais e aprovação no Garmin Connect Developer Program. Quando ativada, o objetivo é importar dados autorizados como atividade, frequência cardíaca e calorias. O restante do app funciona normalmente sem Garmin.

## Arquitetura
- React + Vite
- Vercel
- Neon Auth
- Neon Postgres
- API serverless
- recomendação transparente baseada em regras + histórico do usuário

## Segurança
O app não oferece diagnóstico, tratamento, reabilitação, prescrição médica ou dieta individual.
