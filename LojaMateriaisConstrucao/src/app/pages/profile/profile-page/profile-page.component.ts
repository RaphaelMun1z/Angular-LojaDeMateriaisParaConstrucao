import { Component, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { provideNgxMask } from 'ngx-mask';
import { AuthService } from '../../../core/auth/auth.service';
import { FileUploadService } from '../../../services/fileUpload.service';

@Component({
    selector: 'app-profile-page',
    imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
    providers: [provideNgxMask()],
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.css'
})

export class ProfilePageComponent {
    private authService = inject(AuthService);
    private fileUploadService = inject(FileUploadService); // Injeção necessária para montar a URL
    
    user = signal({
        name: 'Utilizador',
        email: '',
        avatar: ''
    });
    
    constructor() {
        effect(() => {
            const currentUser = this.authService.currentUser();
            
            if (currentUser) {
                let avatarUrl = '';
                
                if (currentUser.avatar) {
                    avatarUrl = currentUser.avatar.startsWith('http') 
                    ? currentUser.avatar 
                    : this.fileUploadService.getPreviewUrl(currentUser.avatar);
                } else {
                    avatarUrl = `https://ui-avatars.com/api/?name=${currentUser.email}&background=0f172a&color=fff&size=128`;
                }
                
                this.user.update(u => ({
                    ...u,
                    email: currentUser.email,
                    name: currentUser.name || currentUser.email.split('@')[0],
                    avatar: avatarUrl
                }));
            }
        });
    }
    
    handleImageError(event: any) {
        const email = this.user().email || 'User';
        event.target.src = `https://ui-avatars.com/api/?name=${email}&background=0f172a&color=fff&size=128`;
    }
    
    logout() {
        this.authService.logout();
    }
}