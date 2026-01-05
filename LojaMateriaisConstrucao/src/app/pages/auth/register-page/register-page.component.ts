import { CommonModule } from '@angular/common';
import { Component, inject, Input, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ReactiveFormsModule } from '@angular/forms';
import { BRAND_CONFIG } from '../../../shared/mocks/BRAND_CONFIG';

@Component({
    selector: 'app-register-page',
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './register-page.component.html',
    styleUrl: './register-page.component.css'
})

export class RegisterPageComponent {
    config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'light';
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
    
    private fb = inject(FormBuilder);
    
    // Estado
    isLoading = signal(false);
    showToast = signal(false);
    
    // Formulário
    signupForm: FormGroup = this.fb.group({
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', Validators.required],
        terms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
    
    // Validação Customizada
    passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
        const password = control.get('password');
        const confirmPassword = control.get('confirmPassword');
        
        if (password && confirmPassword && password.value !== confirmPassword.value) {
            return { mismatch: true };
        }
        return null;
    }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.signupForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    onSubmit() {
        if (this.signupForm.valid) {
            this.isLoading.set(true);
            
            // Simulação
            setTimeout(() => {
                this.isLoading.set(false);
                this.showToast.set(true);
                setTimeout(() => this.showToast.set(false), 4000);
                console.log('Dados:', this.signupForm.value);
            }, 1500);
        } else {
            this.signupForm.markAllAsTouched();
        }
    }
}
