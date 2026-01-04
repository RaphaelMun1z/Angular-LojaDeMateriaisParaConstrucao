// --- CATEGORIAS ---

export interface Categoria {
    id: string;
    nome: string;
    descricao?: string;
    slug: string;
    ativa: boolean;
    categoriaPaiId?: string;
    subcategorias: Categoria[]; 
}

export interface CategoriaRequest {
    nome: string;
    descricao?: string;
    slug: string;
    ativa: boolean;
    categoriaPaiId?: string | null;
}

// --- PRODUTOS ---

export interface Produto {
    id: string;
    codigoControle: string;
    titulo: string;
    descricao: string;
    preco: number;
    precoPromocional?: number;
    estoque: number;
    ativo: boolean;
    pesoKg?: number;
    dimensoes?: string;
    categoria?: Categoria;
}

export interface ProdutoRequest {
    codigoControle: string;
    titulo: string;
    descricao: string;
    preco: number;
    precoPromocional?: number;
    estoque: number;
    ativo: boolean;
    pesoKg?: number;
    dimensoes?: string;
    categoriaId: string;
}

// --- FILTROS ---

export interface ProdutoFiltro {
    termo?: string;
    categoriaId?: string;
    precoMin: number;
    precoMax: number;
    apenasAtivos?: boolean;
}