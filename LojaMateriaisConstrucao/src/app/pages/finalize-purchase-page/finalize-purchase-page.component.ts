import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../core/auth/auth.service';
import { EntregaRequest, MetodoPagamento, PagamentoRequest } from '../../models/pedido.models';
import { CarrinhoService } from '../../services/carrinho.service';
import { PedidoService } from '../../services/pedido.service';
import { UsuarioService } from '../../services/usuario.service';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { AddressFormComponent } from "../../shared/components/address-form/address-form.component";

@Component({
    selector: 'app-finalize-purchase-page',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, NgxMaskDirective, NgxMaskPipe, AddressFormComponent],
    providers: [provideNgxMask()], 
    templateUrl: './finalize-purchase-page.component.html',
    styleUrl: './finalize-purchase-page.component.css'
})

export class FinalizePurchasePageComponent {
    private authService = inject(AuthService);
    private carrinhoService = inject(CarrinhoService);
    private pedidoService = inject(PedidoService);
    public usuarioService = inject(UsuarioService);
    private router = inject(Router);
    private toastr = inject(ToastrService);
    
    // Estado Local
    paymentMethod = signal<'credit' | 'pix' | 'boleto'>('credit');
    isLoading = signal(false);
    selectedAddressId = signal<string | null>(null);
    
    // Estado do Formulário de Endereço
    showAddressForm = signal(false);
    editingAddress = signal<any>(null); // Armazena o endereço que está sendo editado
    
    // Estado do Usuário e Carrinho
    userEmail = computed(() => this.authService.currentUser()?.email || '');
    cartItems = computed(() => this.carrinhoService.carrinho()?.itens || []);
    subtotal = computed(() => this.carrinhoService.valorTotal());
    shippingCost = signal(15.90); 
    total = computed(() => this.subtotal() + this.shippingCost());
    
    addresses = this.usuarioService.enderecos;
    
    constructor() {
        effect(() => {
            const userId = this.authService.currentUser()?.id;
            if (userId) {
                this.carrinhoService.carregarCarrinho(userId);
                this.usuarioService.carregarEnderecos(userId);
            }
        });
        
        effect(() => {
            const addrs = this.addresses();
            if (addrs.length > 0 && !this.selectedAddressId()) {
                const principal = addrs.find(a => a.principal);
                if (principal) {
                    this.selectedAddressId.set(principal.id);
                } else {
                    this.selectedAddressId.set(addrs[0].id);
                }
            }
        });
    }
    
    // --- Lógica de Endereço ---
    
    toggleAddressForm() {
        this.showAddressForm.update(v => !v);
        if (!this.showAddressForm()) {
            this.editingAddress.set(null); // Limpa o estado de edição ao fechar
        }
    }
    
    // MÉTODO QUE FALTAVA: Prepara a edição e abre o formulário
    editAddress(address: any) {
        this.editingAddress.set(address); // Passa os dados para o componente filho via Input
        this.showAddressForm.set(true);   // Abre o componente
    }
    
    deleteAddress(addressId: string) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        if (confirm('Tem certeza que deseja excluir este endereço?')) {
            this.usuarioService.removerEndereco(addressId, userId).subscribe({
                next: () => {
                    this.toastr.info('Endereço removido.');
                    if (this.selectedAddressId() === addressId) {
                        this.selectedAddressId.set(null);
                    }
                },
                error: () => this.toastr.error('Erro ao remover endereço.')
            });
        }
    }
    
    setAsPrimary(addressId: string, event: Event) {
        event.stopPropagation();
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        this.isLoading.set(true);
        this.usuarioService.definirComoPrincipal(addressId, userId).subscribe({
            next: () => {
                this.toastr.success('Endereço definido como principal.');
                this.selectedAddressId.set(addressId);
            },
            error: () => this.toastr.error('Erro ao atualizar endereço principal.'),
            complete: () => this.isLoading.set(false)
        });
    }
    
    // Recebe os dados do componente filho (app-address-form) e salva
    handleAddressSave(addressData: any) {
        const userId = this.authService.currentUser()?.id;
        if (!userId) return;
        
        this.isLoading.set(true);
        
        if (this.editingAddress()) {
            // Atualização
            this.usuarioService.atualizarEndereco(this.editingAddress().id, addressData, userId).subscribe({
                next: () => {
                    this.toastr.success('Endereço atualizado!');
                    this.toggleAddressForm();
                },
                error: () => this.toastr.error('Erro ao atualizar.'),
                complete: () => this.isLoading.set(false)
            });
        } else {
            // Criação (Força ser principal)
            const newAddress = { ...addressData, principal: true };
            this.usuarioService.adicionarEndereco(userId, newAddress).subscribe({
                next: () => {
                    this.toastr.success('Endereço adicionado!');
                    this.toggleAddressForm();
                },
                error: () => this.toastr.error('Erro ao salvar.'),
                complete: () => this.isLoading.set(false)
            });
        }
    }
    
    // --- Lógica de Checkout e Pagamento ---
    setPayment(method: 'credit' | 'pix' | 'boleto') {
        this.paymentMethod.set(method);
    }
    
    confirmarPedido() {
        const userId = this.authService.currentUser()?.id;
        if (!userId) {
            this.toastr.error('Erro de autenticação.', 'Erro');
            return;
        }
        
        if (this.cartItems().length === 0) {
            this.toastr.warning('Seu carrinho está vazio.', 'Atenção');
            return;
        }
        
        if (!this.selectedAddressId()) {
            this.toastr.warning('Selecione um endereço de entrega.', 'Atenção');
            return;
        }
        
        this.isLoading.set(true);
        
        this.pedidoService.checkout(userId).subscribe({
            next: (pedido) => {
                this.processarEntrega(pedido.id);
            },
            error: (err) => {
                console.error(err);
                this.toastr.error('Erro ao criar o pedido.', 'Erro');
                this.isLoading.set(false);
            }
        });
    }
    
    private processarEntrega(pedidoId: string) {
        const enderecoSelecionado = this.addresses().find(a => a.id === this.selectedAddressId());
        
        if (!enderecoSelecionado) {
            this.toastr.error('Erro ao recuperar endereço.', 'Erro');
            this.isLoading.set(false);
            return;
        }
        
        const entregaReq: EntregaRequest = {
            cep: enderecoSelecionado.cep,
            logradouro: enderecoSelecionado.logradouro,
            numero: enderecoSelecionado.numero,
            complemento: enderecoSelecionado.complemento,
            bairro: enderecoSelecionado.bairro,
            cidade: enderecoSelecionado.cidade,
            uf: enderecoSelecionado.uf,
            valorFrete: this.shippingCost(),
            prazoDiasUteis: 5, 
            transportadora: 'Transportadora Padrão' 
        };
        
        this.pedidoService.criarEntrega(pedidoId, entregaReq).subscribe({
            next: () => this.processarPagamento(pedidoId),
            error: (err) => {
                console.error(err);
                this.toastr.error('Erro ao registrar entrega.', 'Erro');
                this.isLoading.set(false);
            }
        });
    }
    
    private processarPagamento(pedidoId: string) {
        const metodoMap: Record<string, MetodoPagamento> = {
            'credit': MetodoPagamento.CARTAO_CREDITO,
            'pix': MetodoPagamento.PIX,
            'boleto': MetodoPagamento.BOLETO
        };
        
        const pagamentoReq: PagamentoRequest = {
            metodo: metodoMap[this.paymentMethod()],
            valor: this.total(),
            numeroParcelas: this.paymentMethod() === 'credit' ? 1 : 1 
        };
        
        this.pedidoService.registrarPagamento(pedidoId, pagamentoReq).subscribe({
            next: () => {
                this.toastr.success('Pedido realizado com sucesso!', 'Parabéns');
                this.carrinhoService.limparEstadoLocal();
                this.router.navigate(['/pedido-confirmado']);
            },
            error: (err) => {
                console.error('Erro no pagamento:', err);
                const msg = err.error && Array.isArray(err.error) ? err.error[0] : 'Houve um erro no pagamento.';
                this.toastr.warning(`Pedido criado, mas: ${msg}`, 'Atenção');
                this.router.navigate(['/pedido', pedidoId]);
            },
            complete: () => this.isLoading.set(false)
        });
    }
}