import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Page, PageableParams } from '../models/shared.models';
import { Produto, ProdutoFiltro, Categoria, ProdutoRequest, CategoriaRequest } from '../models/catalogo.models';
import { Observable, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CatalogoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;
    
    // --- ESTADO (Signals) ---
    // Podemos manter cache de categorias, já que mudam pouco
    private _categorias = signal<Categoria[]>([]);
    public categorias = this._categorias.asReadonly();
    
    // --- AÇÕES ---
    
    // Produtos
    listarProdutosVitrine(pageable?: PageableParams): Observable<Page<Produto>> {
        let params = this.buildPageParams(pageable);
        return this.http.get<Page<Produto>>(`${this.apiUrl}/produtos/vitrine`, { params });
    }
    
    buscarProdutosComFiltro(filtro: ProdutoFiltro, pageable?: PageableParams): Observable<Page<Produto>> {
        let params = this.buildPageParams(pageable);
        
        if (filtro.termo) params = params.set('termo', filtro.termo);
        if (filtro.categoriaId) params = params.set('categoriaId', filtro.categoriaId);
        if (filtro.precoMin) params = params.set('precoMin', filtro.precoMin.toString());
        if (filtro.precoMax) params = params.set('precoMax', filtro.precoMax.toString());
        if (filtro.apenasAtivos !== undefined) params = params.set('apenasAtivos', filtro.apenasAtivos);
        
        return this.http.get<Page<Produto>>(`${this.apiUrl}/produtos/buscar`, { params });
    }
    
    obterProduto(id: string): Observable<Produto> {
        return this.http.get<Produto>(`${this.apiUrl}/produtos/${id}`);
    }
    
    // Admin: Criar/Editar Produto
    salvarProduto(produto: ProdutoRequest): Observable<Produto> {
        return this.http.post<Produto>(`${this.apiUrl}/produtos`, produto);
    }
    
    atualizarProduto(id: string, produto: ProdutoRequest): Observable<Produto> {
        return this.http.put<Produto>(`${this.apiUrl}/produtos/${id}`, produto);
    }
    
    // Categorias
    carregarCategoriasAtivas() {
        this.listarCategoriasAtivas().subscribe(page => this._categorias.set(page.content));
    }
    
    listarCategoriasAtivas(pageable?: PageableParams): Observable<Page<Categoria>> {
        const params = this.buildPageParams(pageable);
        return this.http.get<Page<Categoria>>(`${this.apiUrl}/categorias/ativas`, { params });
    }
    
    listarTodasCategoriasAdmin(pageable?: PageableParams): Observable<Page<Categoria>> {
        const params = this.buildPageParams(pageable);
        return this.http.get<Page<Categoria>>(`${this.apiUrl}/categorias`, { params });
    }
    
    // Utils
    private buildPageParams(pageable?: PageableParams): HttpParams {
        let params = new HttpParams();
        if (pageable) {
            if (pageable.page !== undefined) params = params.set('page', pageable.page);
            if (pageable.size !== undefined) params = params.set('size', pageable.size);
            if (pageable.sort) params = params.set('sort', pageable.sort);
        }
        return params;
    }
}