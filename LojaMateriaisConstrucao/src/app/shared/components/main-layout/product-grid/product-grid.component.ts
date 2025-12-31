import { Component, inject, Input } from '@angular/core';
import { ProductCardComponent } from "../../product-card/product-card.component";
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../../interfaces/Product';
import { CommonModule } from '@angular/common';
import { MOCK_PRODUCTS } from '../../../mocks/MOCK_PRODUCTS';

@Component({
    selector: 'app-product-grid',
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './product-grid.component.html',
    styleUrl: './product-grid.component.css'
})

export class ProductGridComponent {
    private toastr = inject(ToastrService);
    
    @Input() products: Product[] = MOCK_PRODUCTS;
    @Input() viewMode: 'grid' | 'list' = 'grid';
    
    handleAddToCart(product: Product) {
        if (!product.inStock) {
            this.toastr.error('Produto indisponível no momento.', 'Ops!');
            return;
        }
        
        this.toastr.success(`${product.name} adicionado!`, 'Carrinho');
        console.log('Produto adicionado ao carrinho:', product);
    }
    
    openPopup(event: MouseEvent, product: Product) {
        console.log('Abrir Quick View para:', product.id, 'em', event.clientX, event.clientY);
    }
    
    closePopup() {
        console.log('Fechar Quick View');
    }
}
