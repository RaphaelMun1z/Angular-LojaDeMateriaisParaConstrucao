import { Component, inject, Input } from '@angular/core';
import { ProductCardComponent } from "../../product-card/product-card.component";
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { MOCK_PRODUCTS } from '../../../mocks/MOCK_PRODUCTS';
import { ProductFullDetails } from '../../../interfaces/Product';

@Component({
    selector: 'app-product-grid',
    imports: [CommonModule, ProductCardComponent],
    templateUrl: './product-grid.component.html',
    styleUrl: './product-grid.component.css'
})

export class ProductGridComponent {
    private toastr = inject(ToastrService);
    
    @Input() products: ProductFullDetails[] = MOCK_PRODUCTS;
    @Input() viewMode: 'grid' | 'list' = 'grid';
    
    handleAddToCart(product: ProductFullDetails) {
        if (!product.inStock) {
            this.toastr.error('Produto indisponível no momento.', 'Ops!');
            return;
        }
        
        this.toastr.success(`${product.name} adicionado!`, 'Carrinho');
        console.log('Produto adicionado ao carrinho:', product);
    }
    
    openPopup(event: MouseEvent, product: ProductFullDetails) {
    }
    
    closePopup() {
    }
}
