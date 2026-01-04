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
    
    // --- ESTADO (Signals) ---
    
    private _accessToken = signal<string | null>(localStorage.getItem('access_token'));
    public accessToken = this._accessToken.asReadonly();
    
    private _currentUser = signal<User | null>(null);
    public currentUser = this._currentUser.asReadonly();
    
    public isAuthenticated = computed(() => !!this._accessToken());
    
    // --- COMPUTES DE PERMISSÃO (Novos) ---
    
    // Verifica se é Admin
    public isAdmin = computed(() => this.hasRole('ROLE_ADMIN'));
    
    constructor() {
        const token = this._accessToken();
        if (token) {
            this.decodeAndSetUser(token);
        }
    }
    
    // --- MÉTODOS DE VERIFICAÇÃO (Novos) ---
    
    /**
    * Verifica se o usuário tem uma Role ou Permissão específica.
    * Ex: hasRole('ROLE_ADMIN') ou hasRole('PRODUTO_INSERIR')
    */
    hasRole(roleOrPermission: string): boolean {
        const user = this._currentUser();
        // O backend envia tudo (Roles e Permissions) dentro do array 'roles' do JWT
        return user?.roles?.includes(roleOrPermission) ?? false;
    }
    
    /**
    * Verifica se o usuário tem pelo menos uma das roles passadas.
    */
    hasAnyRole(roles: string[]): boolean {
        const user = this._currentUser();
        if (!user || !user.roles) return false;
        return roles.some(role => user.roles!.includes(role));
    }
    
    // --- AÇÕES (Mantidas iguais) ---
    
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
    
    // --- MÉTODOS PRIVADOS ---
    
    private handleAuthSuccess(response: TokenResponse) {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('refresh_token', response.refreshToken);
        localStorage.setItem('username', response.username);
        
        this._accessToken.set(response.accessToken);
        this.decodeAndSetUser(response.accessToken);
    }
    
    private decodeAndSetUser(token: string) {
        try {
            const payload = this.parseJwt(token);
            
            const user: User = {
                email: payload.sub,
                // Garante que roles seja sempre um array, mesmo que venha vazio
                roles: Array.isArray(payload.roles) ? payload.roles : [] 
            };
            console.log(user)
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