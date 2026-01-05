import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-recover-password-page',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './recover-password-page.component.html',
    styleUrl: './recover-password-page.component.css'
})

export class RecoverPasswordPageComponent {
    private fb = inject(FormBuilder);
    
    // Estado
    isLoading = signal(false);
    isSuccess = signal(false);
    showToast = signal(false);
    toastMessage = signal('');
    
    // Formulário
    recoveryForm: FormGroup = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.recoveryForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    onSubmit() {
        if (this.recoveryForm.valid) {
            this.isLoading.set(true);
            
            // Simulação de chamada API
            setTimeout(() => {
                this.isLoading.set(false);
                this.isSuccess.set(true);
                // Não precisamos de toast aqui pois a UI muda para o estado de sucesso
            }, 1500);
        } else {
            this.recoveryForm.markAllAsTouched();
            this.displayToast('Por favor, preencha o e-mail corretamente.');
        }
    }
    
    resetForm() {
        this.isSuccess.set(false);
        this.recoveryForm.reset();
    }
    
    private displayToast(msg: string) {
        this.toastMessage.set(msg);
        this.showToast.set(true);
        setTimeout(() => this.showToast.set(false), 3000);
    }
}
