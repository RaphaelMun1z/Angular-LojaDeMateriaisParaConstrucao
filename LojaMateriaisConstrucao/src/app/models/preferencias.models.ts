export interface Favorito {
    id: string;
    produtoId: string;
    codigoControle: string;
    titulo: string;
    descricao: string;
    categoria: string;
    preco: number;          
    precoOriginal?: number;
    emEstoque: boolean;
    imagens: string[];     
    dataAdicao: string;
}