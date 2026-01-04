import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Pedido } from '../../../models/pedido.models';
import { PageableParams } from '../../../models/shared.models';
import { PedidoService } from '../../../services/pedido.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-admin-orders-page',
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
    templateUrl: './admin-orders-page.component.html',
    styleUrl: './admin-orders-page.component.css'
})

export class AdminOrdersPageComponent implements OnInit {
    private pedidoService = inject(PedidoService);
    private toastr = inject(ToastrService);
    private fb = inject(FormBuilder);
    
    // Estado da UI
    activeFilter = signal<'all' | 'PAGO' | 'PENDENTE' | 'CANCELADO'>('all');
    searchTerm = signal('');
    isLoading = signal(true);
    isUpdating = signal(false); // Loading do modal
    
    // Estado do Modal
    showStatusModal = signal(false);
    selectedOrder = signal<Pedido | null>(null);
    
    // Dados Reais
    orders = signal<Pedido[]>([]);
    totalElements = signal(0);
    currentPage = signal(0);
    pageSize = signal(10);
    
    // Formulário de Status
    statusForm: FormGroup = this.fb.group({
        status: ['', Validators.required],
        notifyClient: [true] // Opção fictícia para enviar email (backend precisaria suportar)
    });
    
    // Lista de Status para o Select
    availableStatuses = [
        { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando Pagamento' },
        { value: 'PAGO', label: 'Pago' },
        { value: 'EM_PREPARACAO', label: 'Em Preparação' },
        { value: 'ENVIADO', label: 'Enviado' },
        { value: 'ENTREGUE', label: 'Entregue' },
        { value: 'CANCELADO', label: 'Cancelado' }
    ];
    
    ngOnInit() {
        this.loadOrders();
    }
    
    loadOrders() {
        this.isLoading.set(true);
        const params: PageableParams = {
            page: this.currentPage(),
            size: this.pageSize(),
            sort: 'dataPedido,desc'
        };
        
        this.pedidoService.listarTodos(params).subscribe({
            next: (page) => {
                this.orders.set(page.content || []);
                this.totalElements.set(page.totalElements || 0);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar pedidos', err);
                this.toastr.error('Erro ao sincronizar pedidos.');
                this.isLoading.set(false);
            }
        });
    }
    
    // --- Lógica do Modal ---
    
    openStatusModal(order: Pedido) {
        this.selectedOrder.set(order);
        this.statusForm.patchValue({
            status: order.status,
            notifyClient: true
        });
        this.showStatusModal.set(true);
    }
    
    confirmStatusUpdate() {
        const order = this.selectedOrder();
        if (!order || this.statusForm.invalid) return;
        
        const newStatus = this.statusForm.value.status;
        
        // Evita chamada desnecessária se não mudou
        if (newStatus === order.status) {
            this.showStatusModal.set(false);
            return;
        }
        
        this.isUpdating.set(true);
        
        this.pedidoService.atualizarStatus(order.id, newStatus).subscribe({
            next: () => {
                this.toastr.success(`Status do pedido #${order.id.substring(0,8)} atualizado!`);
                this.showStatusModal.set(false);
                this.loadOrders(); // Recarrega a lista
            },
            error: (err) => {
                console.error(err);
                this.toastr.error('Erro ao atualizar status.');
            },
            complete: () => this.isUpdating.set(false)
        });
    }
    
    // --- Filtros e Paginação ---
    
    filteredOrders = computed(() => {
        let result = this.orders();
        const term = this.searchTerm().toLowerCase().trim();
        const filter = this.activeFilter();
        
        if (filter !== 'all') {
            result = result.filter(o => o.status === filter);
        }
        
        if (term) {
            result = result.filter(o => 
                o.id.toLowerCase().includes(term) || 
                o.clienteId.toLowerCase().includes(term)
            );
        }
        
        return result;
    });
    
    setFilter(filter: 'all' | 'PAGO' | 'PENDENTE' | 'CANCELADO') {
        this.activeFilter.set(filter);
    }
    
    changePage(delta: number) {
        const next = this.currentPage() + delta;
        if (next >= 0 && (next * this.pageSize() < this.totalElements())) {
            this.currentPage.set(next);
            this.loadOrders();
        }
    }
    
    // Helpers Visuais
    getPaymentBadgeClass(status: string): string {
        switch (status) {
            case 'PAGO':
            case 'ENTREGUE': return 'bg-green-50 text-green-700 border-green-200';
            case 'AGUARDANDO_PAGAMENTO': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'CANCELADO': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    }
    
    getFulfillmentBadgeClass(status: string): string {
        switch (status) {
            case 'ENTREGUE': return 'bg-brand-50 text-brand-700 border-brand-200';
            case 'ENVIADO': return 'bg-purple-50 text-purple-700 border-purple-200';
            case 'EM_PREPARACAO': return 'bg-blue-50 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-500 border-gray-200';
        }
    }
}