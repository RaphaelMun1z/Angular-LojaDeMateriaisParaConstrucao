import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Cliente, Endereco, EnderecoRequest } from '../models/usuario.models';
import { Observable, tap } from 'rxjs';
import { PageableParams, Page } from '../models/shared.models';

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}`;
    
    // Estado local para endereços
    private _enderecos = signal<Endereco[]>([]);
    public enderecos = this._enderecos.asReadonly();
    
    // --- GESTÃO DE CLIENTES (ADMIN) ---
    
    /**
    * Lista todos os clientes cadastrados no sistema (Paginado)
    */
    listarTodosClientes(pageable?: PageableParams): Observable<Page<Cliente>> {
        let params = new HttpParams();
        if (pageable?.page !== undefined) params = params.set('page', pageable.page);
        if (pageable?.size !== undefined) params = params.set('size', pageable.size);
        if (pageable?.sort) params = params.set('sort', pageable.sort);
        
        return this.http.get<Page<Cliente>>(`${this.apiUrl}/clientes`, { params });
    }
    
    // --- GESTÃO DE ENDEREÇOS ---
    
    listarEnderecos(clienteId: string): Observable<Endereco[]> {
        return this.http.get<Endereco[]>(`${this.apiUrl}/cliente/${clienteId}`).pipe(
            tap(lista => this._enderecos.set(lista))
        );
    }
    
    carregarEnderecos(clienteId: string) {
        this.http.get<Endereco[]>(`${this.apiUrl}/enderecos/cliente/${clienteId}`)
        .subscribe({
            next: (lista) => this._enderecos.set(lista),
            error: (err) => console.error('Erro ao carregar endereços', err)
        });
    }
    
    adicionarEndereco(clienteId: string, dto: EnderecoRequest): Observable<Endereco> {
        return this.http.post<Endereco>(`${this.apiUrl}/enderecos/cliente/${clienteId}`, dto)
        .pipe(tap(() => this.carregarEnderecos(clienteId)));
    }
    
    atualizarEndereco(id: string, dto: EnderecoRequest, clienteId: string): Observable<Endereco> {
        return this.http.put<Endereco>(`${this.apiUrl}/enderecos/${id}`, dto)
        .pipe(tap(() => this.carregarEnderecos(clienteId)));
    }
    
    removerEndereco(id: string, clienteId: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/enderecos/${id}`)
        .pipe(tap(() => this.carregarEnderecos(clienteId)));
    }
    
    definirComoPrincipal(id: string, clienteId: string): Observable<void> {
        return this.http.patch<void>(`${this.apiUrl}/enderecos/${id}/principal`, {})
        .pipe(tap(() => this.carregarEnderecos(clienteId)));
    }
}