import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/auth.service';
import { Favorito } from '../models/preferencias.models';
import { Page, PageableParams } from '../models/shared.models';
import { ToastrService } from 'ngx-toastr';
import { tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FavoritoService {
    private http = inject(HttpClient);
    private authService = inject(AuthService);
    private toastr = inject(ToastrService);
    private apiUrl = `${environment.apiUrl}/favoritos`;
    
    // --- ESTADO REATIVO ---
    // Mantemos um Set com os IDs dos produtos favoritados para verificação rápida (O(1)) no frontend
    private _favoritosIds = signal<Set<string>>(new Set());
    public favoritosIds = this._favoritosIds.asReadonly();
    
    constructor() {
        // Sempre que o usuário mudar (login/logout), recarregamos a lista de IDs
        effect(() => {
            const user = this.authService.currentUser();
            if (user?.id) {
                this.carregarIdsFavoritos(user.id);
            } else {
                this._favoritosIds.set(new Set()); // Limpa se deslogar
            }
        });
    }
    
    /**
    * Verifica se um produto está na lista de favoritos local
    */
    isFavorito(produtoId: string): boolean {
        return this.favoritosIds().has(produtoId);
    }
    
    // --- API ---
    
    listar(clienteId: string, pageable?: PageableParams) {
        let params = new HttpParams();
        if (pageable?.page) params = params.set('page', pageable.page);
        if (pageable?.size) params = params.set('size', pageable.size);
        if (pageable?.sort) params = params.set('sort', pageable.sort);
        
        return this.http.get<Page<Favorito>>(`${this.apiUrl}/cliente/${clienteId}`, { params });
    }
    
    // Carrega apenas para preencher o Set de IDs (pode ser otimizado no backend para retornar só IDs futuramente)
    private carregarIdsFavoritos(clienteId: string) {
        // Busca uma página grande para tentar pegar todos os IDs iniciais
        // Idealmente: Criar endpoint backend: GET /favoritos/cliente/{id}/ids
        this.listar(clienteId, { page: 0, size: 100 }).subscribe({
            next: (page) => {
                const ids = new Set(page.content.map(f => f.produtoId));
                this._favoritosIds.set(ids);
            }
        });
    }
    
    adicionar(produtoId: string) {
        const clienteId = this.authService.currentUser()?.id;
        if (!clienteId) return;
        
        // Atualização otimista (UI update first)
        this._favoritosIds.update(set => {
            const newSet = new Set(set);
            newSet.add(produtoId);
            return newSet;
        });
        
        this.http.post<Favorito>(`${this.apiUrl}/cliente/${clienteId}/produto/${produtoId}`, {}).subscribe({
            next: () => this.toastr.success('Adicionado aos favoritos'),
            error: () => {
                // Rollback em caso de erro
                this._favoritosIds.update(set => {
                    const newSet = new Set(set);
                    newSet.delete(produtoId);
                    return newSet;
                });
                this.toastr.error('Erro ao adicionar favorito');
            }
        });
    }
    
    remover(produtoId: string) {
        const clienteId = this.authService.currentUser()?.id;
        if (!clienteId) return;
        
        // Atualização otimista
        this._favoritosIds.update(set => {
            const newSet = new Set(set);
            newSet.delete(produtoId);
            return newSet;
        });
        
        this.http.delete(`${this.apiUrl}/cliente/${clienteId}/produto/${produtoId}`).subscribe({
            next: () => this.toastr.info('Removido dos favoritos'),
            error: () => {
                // Rollback
                this._favoritosIds.update(set => {
                    const newSet = new Set(set);
                    newSet.add(produtoId);
                    return newSet;
                });
                this.toastr.error('Erro ao remover favorito');
            }
        });
    }
    
    toggle(produtoId: string) {
        if (!this.authService.isAuthenticated()) {
            this.toastr.info('Faça login para favoritar produtos.');
            return;
        }
        
        if (this.isFavorito(produtoId)) {
            this.remover(produtoId);
        } else {
            this.adicionar(produtoId);
        }
    }
    
    limparTudo(clienteId: string) {
        return this.http.delete(`${this.apiUrl}/cliente/${clienteId}/limpar`).pipe(
            tap(() => this._favoritosIds.set(new Set()))
        );
    }
}