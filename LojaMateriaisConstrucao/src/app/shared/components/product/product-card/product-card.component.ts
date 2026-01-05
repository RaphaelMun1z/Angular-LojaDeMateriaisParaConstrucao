import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto } from '../../../../models/catalogo.models';
import { Router } from '@angular/router';

@Component({
    selector: 'app-product-card',
    imports: [CommonModule],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css'
})

export class ProductCardComponent {
    private router = inject(Router);
    
    @Input({ required: true }) product!: Produto;
    @Input() viewMode: 'grid' | 'list' = 'grid';
    
    @Output() addToCart = new EventEmitter<Produto>();
        
    onAddToCart(event: Event): void {
        event.stopPropagation();
        if (this.product.estoque > 0) {
            this.addToCart.emit(this.product);
        }
    }
    
    onCardClick(): void {
        this.router.navigate(['/produto', this.product.id]);
    }
}
