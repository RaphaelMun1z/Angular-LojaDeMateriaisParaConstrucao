import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { ProductCardComponent } from '../../product/product-card/product-card.component';
import { AuthService } from '../../../../core/auth/auth.service';
import { CarrinhoService } from '../../../../services/carrinho.service';
import { Produto } from '../../../../models/catalogo.models';

@Component({
    selector: 'app-product-grid',
    standalone: true,
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './product-grid.component.html',
    styleUrl: './product-grid.component.css'
})
export class ProductGridComponent {
    private toastr = inject(ToastrService);
    private carrinhoService = inject(CarrinhoService);
    private authService = inject(AuthService);
    private router = inject(Router);
    
    // Dados e Layout
    @Input() products: Produto[] = []; 
    @Input() viewMode: 'grid' | 'list' = 'grid';
    
    // Metadados de Paginação
    @Input() totalElements = 0;
    @Input() totalPages = 0;
    @Input() currentPage = 0;
    
    @Output() pageChange = new EventEmitter<number>();
    
    selectedProduct = signal<Produto | null>(null);
    
    // Gera o array de números de página para o @for
    get pagesArray(): number[] {
        return Array.from({ length: this.totalPages }, (_, i) => i);
    }
    
    changePage(page: number) {
        if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
            this.pageChange.emit(page);
            // Scroll suave para o topo do grid ao mudar de página
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    handleAddToCart(product: Produto) {
        if (product.estoque <= 0) {
            this.toastr.error('Produto indisponível no momento.', 'Ops!');
            return;
        }
        
        if (!this.authService.isAuthenticated()) {
            this.toastr.info('Faça login para adicionar ao carrinho.', 'Atenção');
            this.router.navigate(['/login']);
            return;
        }
        
        const user = this.authService.currentUser();
        const clienteId = user?.id;
        
        if (!clienteId) {
            this.toastr.error('Erro de sessão. Faça login novamente.');
            return;
        }
        
        this.carrinhoService.adicionarItem(clienteId, product.id).subscribe({
            next: () => this.toastr.success(`${product.titulo} adicionado!`, 'Carrinho'),
            error: (err) => {
                this.toastr.error('Erro ao adicionar produto.', 'Erro');
                console.error(err);
            }
        });
    }
    
    openPopup(product: Produto) {
        this.selectedProduct.set(product);
    }
    
    closePopup() {
        this.selectedProduct.set(null);
    }
}