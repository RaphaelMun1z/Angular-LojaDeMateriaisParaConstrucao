import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from '../../interfaces/Product';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-product-card',
    imports: [CommonModule],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css'
})

export class ProductCardComponent {
    @Input({ required: true }) product!: Product;
    @Input() viewMode: 'grid' | 'list' = 'grid';
    
    @Output() addToCart = new EventEmitter<Product>();
    @Output() showQuickView = new EventEmitter<MouseEvent>();
    @Output() hideQuickView = new EventEmitter<void>();
    
    get installmentValue(): string {
        return (this.product.price / 10).toFixed(2).replace('.', ',');
    }
    
    get hasDiscount(): boolean {
        return (this.product.discount || 0) > 0;
    }
    
    get oldPrice(): string | null {
        if (!this.hasDiscount) return null;
        return (this.product.price * (1 + (this.product.discount || 0) / 100))
        .toFixed(2)
        .replace('.', ',');
    }
    
    get formattedPrice(): string {
        return this.product.price.toFixed(2).replace('.', ',');
    }
    
    get isLowStock(): boolean {
        return this.product.inStock && (this.product.stockCount || 0) < 5;
    }
    
    get stars(): number[] {
        const totalStars = 5;
        const filledStars = Math.round(this.product.rating);
        return Array(totalStars).fill(0).map((_, i) => i < filledStars ? 1 : 0);
    }
    
    // Ações
    onAddToCart(event: Event): void {
        event.stopPropagation();
        if (this.product.inStock) {
            this.addToCart.emit(this.product);
        }
    }
    
    onMouseEnter(event: MouseEvent): void {
        this.showQuickView.emit(event);
    }
    
    onMouseLeave(): void {
        this.hideQuickView.emit();
    }
}
