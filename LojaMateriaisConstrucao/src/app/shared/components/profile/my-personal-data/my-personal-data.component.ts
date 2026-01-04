import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
    selector: 'app-my-personal-data',
    imports: [CommonModule, FormsModule],
    templateUrl: './my-personal-data.component.html',
    styleUrl: './my-personal-data.component.css'
})
export class MyPersonalDataComponent {
    private authService = inject(AuthService);
    private toastr = inject(ToastrService);
    
    // Estado local do formulário
    user = signal({
        name: '',
        email: '',
        cpf: '',
        phone: ''
    });
    
    constructor() {
        // Sincroniza dados do Auth com o formulário local
        effect(() => {
            const currentUser = this.authService.currentUser();
            if (currentUser) {
                this.user.update(u => ({
                    ...u,
                    email: currentUser.email,
                    // Como o token JWT atual tem ID, email e roles, usamos o email como base para o nome
                    // Futuramente, poderíamos ter um endpoint /me para buscar CPF/Telefone
                    name: currentUser.email.split('@')[0]
                }));
            }
        });
    }
    
    savePersonalData(event: Event) {
        event.preventDefault();
        // Aqui conectaria com um endpoint PUT /clientes/{id} no futuro
        this.toastr.info('Funcionalidade de atualização de perfil em breve!', 'Aviso');
    }
}
