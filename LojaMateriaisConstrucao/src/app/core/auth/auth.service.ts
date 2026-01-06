import { Injectable, signal, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginRequest, RegisterRequest, TokenResponse, User } from '../../models/auth.models'; 
import { tap, map, catchError, of, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = `${environment.apiUrl}/auth`;
    private clienteUrl = `${environment.apiUrl}/clientes`; // URL para buscar dados frescos
    
    private _accessToken = signal<string | null>(localStorage.getItem('access_token'));
    public accessToken = this._accessToken.asReadonly();
    
    private _currentUser = signal<User | null>(null);
    public currentUser = this._currentUser.asReadonly();
    
    public isAuthenticated = computed(() => !!this._accessToken());
    
    public isAdmin = computed(() => this.hasRole('ROLE_ADMIN'));
    
    constructor() {
        const token = this._accessToken();
        if (token) {
            // 1. Restaura estado inicial pelo Token (Rápido)
            this.decodeAndSetUser(token);
            
            // 2. Busca dados frescos do banco (Seguro e Atualizado)
            // Isso resolve o problema de dados antigos ou faltantes (como telefone) no F5
            this.refreshUserData();
        }
    }
    
    /**
    * Busca os dados mais recentes do servidor (/me) e atualiza o estado em memória.
    * Não salva nada sensível no localStorage.
    */
    refreshUserData() {
        this.http.get<User>(`${this.clienteUrl}/me`).subscribe({
            next: (userFresquinho) => {
                // Atualiza o sinal com os dados reais do banco
                this.updateUserSignal(userFresquinho);
            },
            error: (err) => console.error('Erro ao sincronizar perfil em background', err)
        });
    }
    
    /**
    * Atualiza apenas o estado local (Signal) em memória.
    * Usado após upload de foto ou edição de perfil.
    */
    updateUser(updates: Partial<User>) {
        this._currentUser.update(current => {
            if (!current) return null;
            return { ...current, ...updates };
        });
    }
    
    // Método privado para centralizar a atualização do signal
    private updateUserSignal(user: User) {
        this._currentUser.set(user);
    }
    
    // ... (Métodos de Role mantidos iguais) ...
    hasRole(roleOrPermission: string): boolean {
        const user = this._currentUser();
        return Array.isArray(user?.roles) ? user.roles.includes(roleOrPermission) : false;
    }
    
    hasAnyRole(roles: string[]): boolean {
        const user = this._currentUser();
        if (!user || !Array.isArray(user.roles)) return false;
        return roles.some(role => user.roles!.includes(role));
    }
    
    login(credentials: LoginRequest): Observable<boolean> {
        return this.http.post<TokenResponse>(`${this.apiUrl}/signin`, credentials).pipe(
            tap(response => this.handleAuthSuccess(response)),
            map(() => true),
            catchError(error => {
                console.error('Erro no login', error);
                return of(false);
            })
        );
    }
    
    register(data: RegisterRequest): Observable<boolean> {
        return this.http.post(`${this.apiUrl}/signup`, data).pipe(
            map(() => true),
            catchError(error => {
                console.error('Erro no registo', error);
                return of(false);
            })
        );
    }
    
    logout() {
        this._accessToken.set(null);
        this._currentUser.set(null);
        
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('username');
        
        this.router.navigate(['/login']);
    }
    
    cleanSession() {
        this.logout();
    }
    
    private handleAuthSuccess(response: TokenResponse) {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('username', response.username);
        
        this._accessToken.set(response.accessToken);
        
        // 1. Define estado inicial pelo Token
        this.decodeAndSetUser(response.accessToken);
        
        // 2. Busca dados completos imediatamente (para ter telefone/avatar atualizados)
        this.refreshUserData();
    }
    
    private decodeAndSetUser(token: string) {
        try {
            const payload = this.parseJwt(token);
            
            // Estado inicial básico (apenas o que tem no token)
            const user: User = {
                id: payload.id,
                email: payload.sub,
                roles: Array.isArray(payload.roles) ? payload.roles : [],
                name: payload.name || payload.sub.split('@')[0],
                avatar: undefined
            };
            
            this._currentUser.set(user);
        } catch (e) {
            console.error('Erro ao decodificar token', e);
            this.logout();
        }
    }
    
    private parseJwt(token: string) {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        
        return JSON.parse(jsonPayload);
    }
}