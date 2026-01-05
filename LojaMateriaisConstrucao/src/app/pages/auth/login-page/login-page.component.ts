import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';

@Component({
    selector: 'app-login-page',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login-page.component.html',
    styleUrl: './login-page.component.css'
})

export class LoginPageComponent {
    config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'light';
    
    private fb = inject(FormBuilder);
    private authService = inject(AuthService);
    private router = inject(Router);
    
    // Estado
    isLoading = signal(false);
    showPassword = signal(false);
    
    // Estado do Toast (Notificação)
    showToast = signal(false);
    toastData = signal({ title: '', message: '', type: 'success' as 'success' | 'error' });
    
    // Formulário Login
    loginForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required]]
    });
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.loginForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    togglePassword() {
        this.showPassword.update(v => !v);
    }
    
    onSubmit() {
        if (this.loginForm.valid) {
            this.isLoading.set(true);
            
            // Prepara o objeto para a API (mapeando password -> senha)
            const { email, password } = this.loginForm.value;
            const credentials = { email, senha: password };
            
            this.authService.login(credentials).subscribe({
                next: (success) => {
                    this.isLoading.set(false);
                    if (success) {
                        this.exibirToast('Bem-vindo!', 'Login realizado com sucesso.', 'success');
                        // Redireciona após um breve delay para o usuário ver o toast
                        setTimeout(() => this.router.navigate(['/']), 1000); 
                    } else {
                        this.exibirToast('Erro de Acesso', 'E-mail ou senha inválidos.', 'error');
                    }
                },
                error: (err) => {
                    this.isLoading.set(false);
                    this.exibirToast('Erro no Servidor', 'Tente novamente mais tarde.', 'error');
                    console.error(err);
                }
            });
        } else {
            this.loginForm.markAllAsTouched();
        }
    }
    
    private exibirToast(title: string, message: string, type: 'success' | 'error') {
        this.toastData.set({ title, message, type });
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 4000);
    }
}
