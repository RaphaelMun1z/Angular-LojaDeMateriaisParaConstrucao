🏗️ ConstruMonte - E-commerce de Materiais de Construção

Bem-vindo ao repositório do ConstruMonte, uma plataforma de e-commerce moderna e robusta desenvolvida para lojas de materiais de construção. Este projeto utiliza uma arquitetura full-stack completa e escalável.

📸 Preview

(Adicione aqui um GIF ou prints da tela inicial do seu projeto)

🚀 Funcionalidades

O projeto conta com diversas funcionalidades essenciais para um e-commerce:

🏠 Catálogo (Home):

Listagem de produtos com filtros dinâmicos (Categoria, Preço, Marca, Avaliação) integrados à API.

Alternância entre visualização em Grade e Lista.

Busca e ordenação via backend.

Banner rotativo (Hero Carousel) com ofertas.

Quick View: Popup interativo ao passar o mouse sobre os produtos.

📦 Página do Produto:

Galeria de imagens com zoom.

Cálculo de frete simulado.

Abas de navegação (Visão Geral, Especificações, Avaliações).

🛒 Carrinho de Compras:

Gestão de itens persistente.

Resumo financeiro com cálculo de frete.

👤 Área do Usuário:

Autenticação e Autorização (Login/Cadastro).

Perfil completo com Dashboard.

Histórico de pedidos com rastreamento.

Gestão de endereços e dados pessoais.

📄 Institucional:

Páginas de "Sobre Nós", "Política de Privacidade" e "FAQ/Ajuda".

🛠️ Tecnologias Utilizadas

Frontend

Angular: Framework principal para a construção da interface SPA.

TypeScript: Linguagem base para lógica do frontend.

Tailwind CSS: Estilização utilitária para um design rápido e responsivo.

Phosphor Icons: Ícones vetoriais modernos.

Backend

Java 21: Linguagem de programação robusta (LTS).

Spring Boot: Framework para criação de APIs RESTful e microserviços.

Spring Data JPA: Camada de persistência de dados.

Spring Security: Gerenciamento de autenticação e autorização (JWT).

Banco de Dados

PostgreSQL: Banco de dados relacional robusto e confiável.

📂 Estrutura do Projeto

Abaixo está a arquitetura base do projeto, separando claramente as responsabilidades no backend e frontend.

/
├── backend/                    # API Java Spring Boot
│   ├── src/main/java           # Código fonte
│   │   └── com/projeto         # Pacote raiz da aplicação
│   │       ├── config/         # Configurações globais (Security, Cors, Swagger)
│   │       ├── controllers/    # Camada de controle (Endpoints REST)
│   │       ├── models/         # Entidades do domínio (JPA Entities)
│   │       ├── repositories/   # Interfaces de acesso a dados
│   │       ├── services/       # Regras de negócio
│   │       └── dtos/           # Objetos de transferência de dados (Request/Response)
│   └── src/main/resources      # Arquivos de configuração e migrações
│
├── frontend/                   # Aplicação Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/           # Serviços singleton, guards e interceptors
│   │   │   ├── shared/         # Componentes, diretivas e pipes reutilizáveis
│   │   │   ├── layout/         # Componentes estruturais (Header, Footer, Nav)
│   │   │   ├── features/       # Módulos funcionais (Páginas e domínios do negócio)
│   │   │   ├── app.component.ts
│   │   │   └── app.routes.ts   # Definição de rotas
│   │   ├── assets/             # Recursos estáticos (Imagens, fontes, i18n)
│   │   └── styles/             # Estilos globais e configuração do Tailwind
│   ├── angular.json
│   └── package.json
└── README.md                   # Documentação do projeto


🚀 Como Rodar o Projeto

Pré-requisitos

Node.js e npm (para o Angular)

Java JDK 21 (para o Spring Boot)

Maven (gerenciador de dependências Java)

PostgreSQL (instalado e rodando)

1. Configuração do Banco de Dados

Crie um banco de dados no PostgreSQL chamado construmonte_db e configure as credenciais no arquivo application.properties do backend.

2. Rodando o Backend (Spring Boot)

cd backend
mvn spring-boot:run


O servidor iniciará normalmente na porta 8080.

3. Rodando o Frontend (Angular)

cd frontend
npm install
ng serve


Acesse a aplicação em http://localhost:4200.

🎨 Design System

O projeto utiliza uma paleta de cores personalizada baseada em tons de laranja (construção) e cinza:

Cor Primária (Brand): #ea580c (Laranja/Tijolo)

Font Family: Inter (Google Fonts)

🤝 Contribuição

Contribuições são sempre bem-vindas! Se você tiver alguma ideia para melhorar este projeto:

Faça um Fork do projeto.

Crie uma Branch para sua Feature (git checkout -b feature/NovaFeature).

Faça o Commit (git commit -m 'Adicionando uma nova feature').

Faça o Push (git push origin feature/NovaFeature).

Abra um Pull Request.

📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

Desenvolvido com 🧡 por Seu Nome