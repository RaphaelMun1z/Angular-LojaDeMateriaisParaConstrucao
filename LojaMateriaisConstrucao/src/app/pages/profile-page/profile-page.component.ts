import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/auth/auth.service';
import { UsuarioService } from '../../services/usuario.service';
import { MyOrdersPageComponent } from '../my-orders-page/my-orders-page.component';
import { MyAddressesComponent } from '../../shared/components/profile/my-addresses/my-addresses.component';
import { MyPersonalDataComponent } from "../../shared/components/profile/my-personal-data/my-personal-data.component";

@Component({
    selector: 'app-profile-page',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, MyOrdersPageComponent, MyAddressesComponent, MyPersonalDataComponent],
    providers: [provideNgxMask()],
    templateUrl: './profile-page.component.html',
    styleUrl: './profile-page.component.css'
})

export class ProfilePageComponent implements OnInit {
    private authService = inject(AuthService);
    public usuarioService = inject(UsuarioService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private toastr = inject(ToastrService);
    private fb = inject(FormBuilder);
    
    // Estado da UI
    activeSection = signal<'personal' | 'orders' | 'addresses' | 'wallet'>('personal');
    showAddressForm = signal(false);
    isLoading = signal(false);
    
    // Formulário de Endereço (Mesma estrutura do checkout)
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
    
    // Dados do Usuário (Mock parcial pois a API de 'Meus Dados' ainda não foi implementada no backend)
    user = signal({
        name: 'Usuário',
        email: '',
        cpf: '',
        phone: '',
        memberSince: new Date().getFullYear().toString(),
        avatar: ''
    });
    
    // Acessa endereços via Signal do serviço
    addresses = this.usuarioService.enderecos;
    
    constructor() {
        // Carrega dados iniciais
        effect(() => {
            const currentUser = this.authService.currentUser();
            if (currentUser) {
                this.user.update(u => ({
                    ...u,
                    email: currentUser.email,
                    name: currentUser.email.split('@')[0], // Nome provisório baseado no email
                    avatar: `https://ui-avatars.com/api/?name=${currentUser.email}&background=0D8ABC&color=fff&size=128`
                }));
                
                if (currentUser.id) {
                    this.usuarioService.carregarEnderecos(currentUser.id);
                }
            }
        });
    }
    
    ngOnInit() {
        // Detecta fragmento na URL para abrir a aba correta (ex: /perfil#pedidos)
        this.route.fragment.subscribe(fragment => {
            if (fragment === 'pedidos') {
                this.setActiveSection('orders');
            } else if (fragment === 'enderecos') {
                this.setActiveSection('addresses');
            }
        });
    }
    
    setActiveSection(section: 'personal' | 'orders' | 'addresses' | 'wallet') {
        this.activeSection.set(section);
    }
    
    logout() {
        this.authService.logout();
    }
    
    // --- Lógica de Endereços ---
    
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
    
    // --- Lógica de Dados Pessoais ---
    
    savePersonalData(event: Event) {
        event.preventDefault();
        // Como ainda não temos endpoint PUT /clientes/{id}, apenas simulamos
        this.toastr.info('Funcionalidade de atualização de perfil em breve!', 'Aviso');
    }
}