import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-my-account-area',
    imports: [CommonModule, RouterLink],
    templateUrl: './my-account-area.component.html',
    styleUrl: './my-account-area.component.css'
})
export class MyAccountAreaComponent {
    authService = inject(AuthService);
    isMenuOpen = signal(false);
    
    toggleMenu() {
        this.isMenuOpen.update(v => !v);
    }
    
    onMouseEnter() {
        this.isMenuOpen.set(true);
    }
    
    onMouseLeave() {
        this.isMenuOpen.set(false);
    }
    
    logout() {
        this.authService.logout();
    }
    
    /**
    * Retorna o nome do usuário (preferencialmente) ou o email formatado
    */
    get userName(): string {
        const user = this.authService.currentUser();
        if (user && user.name) {
            // Pega apenas o primeiro nome se for muito longo
            return user.name.split(' ')[0];
        }
        return user?.email?.split('@')[0] || 'Minha Conta';
    }
    
    /**
    * Retorna a URL do avatar (se existir) ou gera um padrão
    */
    get userAvatar(): string {
        const user = this.authService.currentUser();
        
        // Se já tivermos a URL completa salva no estado global (feito no MyPersonalData)
        if (user?.avatar) {
            return user.avatar;
        }
        
        // Fallback padrão
        return `https://ui-avatars.com/api/?name=${this.userName}&background=0f172a&color=fff&size=128`;
    }
    
    handleImageError(event: any) {
        event.target.src = `https://ui-avatars.com/api/?name=${this.userName}&background=0f172a&color=fff&size=128`;
    }
}
