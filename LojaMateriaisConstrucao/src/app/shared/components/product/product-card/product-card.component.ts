import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Produto } from '../../../../models/catalogo.models';
import { Router } from '@angular/router';
import { FavoritoService } from '../../../../services/favorito.service';

@Component({
    selector: 'app-product-card',
    imports: [CommonModule],
    templateUrl: './product-card.component.html',
    styleUrl: './product-card.component.css'
})

export class ProductCardComponent {
    private router = inject(Router);
    public favoritoService = inject(FavoritoService); // Public para usar no HTML
    
    @Input({ required: true }) product!: Produto;
    @Input() viewMode: 'grid' | 'list' = 'grid';
    
    @Output() addToCart = new EventEmitter<Produto>();
    
    get mainImage(): string {
        const imagens = this.product.imagens;
        if (!imagens || imagens.length === 0) {
            return '';
        }
        const imagemPrincipal = imagens.find(img => img.principal);
        if (imagemPrincipal) {
            return imagemPrincipal.url;
        }
        const imagensOrdenadas = [...imagens].sort((a, b) => a.ordem - b.ordem);
        return imagensOrdenadas[0].url;
    }
    
    onAddToCart(event: Event): void {
        event.stopPropagation();
        if (this.product.estoque > 0) {
            this.addToCart.emit(this.product);
        }
    }
    
    // Nova ação para o botão de favorito
    onToggleFavorite(event: Event): void {
        event.stopPropagation();
        this.favoritoService.toggle(this.product.id);
    }
    
    onCardClick(): void {
        this.router.navigate(['/produto', this.product.id]);
    }
}
