import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/auth.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';

@Component({
    selector: 'app-my-addresses',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe],
    templateUrl: './my-addresses.component.html',
    styleUrl: './my-addresses.component.css'
})
export class MyAddressesComponent {
    private authService = inject(AuthService);
    public usuarioService = inject(UsuarioService);
    private toastr = inject(ToastrService);
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    
    // Estado da UI
    showAddressForm = signal(false);
    isLoading = signal(false);
    isLoadingCep = signal(false);
    
    // Acessa endereços via Signal do serviço
    addresses = this.usuarioService.enderecos;
    
    // Formulário
    addressForm: FormGroup = this.fb.group({
        apelido: ['', Validators.required],
        cep: ['', [Validators.required, Validators.minLength(8)]],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        uf: ['', [Validators.required, Validators.maxLength(2)]],
        principal: [false]
    });
    
    constructor() {
        // Garante que os endereços sejam carregados ao iniciar este componente
        effect(() => {
            const currentUser = this.authService.currentUser();
            if (currentUser?.id) {
                this.usuarioService.carregarEnderecos(currentUser.id);
            }
        });
    }
    
    // --- Lógica de CEP (ViaCEP) ---
    buscarCep() {
        const cep = this.addressForm.get('cep')?.value?.replace(/\D/g, '');
        if (!cep || cep.length !== 8) return;
        
        this.isLoadingCep.set(true);
        
        this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
            next: (dados) => {
                if (dados.erro) {
                    this.toastr.warning('CEP não encontrado.', 'Atenção');
                    this.addressForm.get('cep')?.setErrors({ invalid: true });
                } else {
                    this.addressForm.patchValue({
                        logradouro: dados.logradouro,
                        bairro: dados.bairro,
                        cidade: dados.localidade,
                        uf: dados.uf,
                        complemento: dados.complemento
                    });
                    this.toastr.success('Endereço encontrado!', 'Sucesso');
                }
            },
            error: () => this.toastr.error('Erro ao buscar o CEP.', 'Erro'),
            complete: () => this.isLoadingCep.set(false)
        });
    }
    
    // --- Lógica de CRUD ---
    
    toggleAddressForm() {
        this.showAddressForm.update(v => !v);
        if (!this.showAddressForm()) {
            this.addressForm.reset();
        }
    }
    
    saveAddress() {
        if (this.addressForm.invalid) {
            this.addressForm.markAllAsTouched();
            return;
        }
        
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        this.isLoading.set(true);
        const newAddress = this.addressForm.value;
        
        this.usuarioService.adicionarEndereco(userId, newAddress).subscribe({
            next: () => {
                this.toastr.success('Endereço cadastrado com sucesso!');
                this.toggleAddressForm();
            },
            error: () => this.toastr.error('Erro ao salvar endereço.'),
            complete: () => this.isLoading.set(false)
        });
    }
    
    deleteAddress(id: string) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        if (confirm('Tem certeza que deseja excluir este endereço?')) {
            this.usuarioService.removerEndereco(id, userId).subscribe({
                next: () => this.toastr.info('Endereço removido.'),
                error: () => this.toastr.error('Erro ao remover endereço.')
            });
        }
    }
    
    setAsPrimary(id: string) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        this.usuarioService.definirComoPrincipal(id, userId).subscribe({
            next: () => this.toastr.success('Endereço principal atualizado.'),
            error: () => this.toastr.error('Erro ao atualizar.')
        });
    }
}
