import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Product } from '../../shared/interfaces/Product';
import { MOCK_PRODUCTS } from '../../shared/mocks/MOCK_PRODUCTS';

@Component({
    selector: 'app-product-page',
    imports: [CommonModule, FormsModule, RouterLink],
    templateUrl: './product-page.component.html',
    styleUrl: './product-page.component.css'
})

export class ProductPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private toastr = inject(ToastrService);
    // private cartService = inject(CartService);
    
    product: Product | undefined;
    currentImage: string = '';
    activeTab: 'overview' | 'specs' | 'reviews' = 'overview';
    quantity: number = 1;
    
    // Variáveis para Zoom
    zoomTransform = 'scale(1)';
    zoomOrigin = 'center center';
    
    // Variáveis de Frete
    zipCode: string = '';
    shippingResult: null | { type: string, days: number, price: number }[] = null;
    
    // Mock de Dados Extras
    productExtras = {
        specs: [
            { label: "Modelo", value: "PRO-X" },
            { label: "Peso", value: "12 kg" },
            { label: "Material", value: "Aço Inoxidável" },
            { label: "Garantia", value: "12 meses" },
            { label: "Cor", value: "Cinza" },
            { label: "Uso Indicado", value: "Interno e Externo" }
        ],
        reviews: [
            { user: "Carlos S.", date: "10/10/2023", rating: 5, text: "Produto excelente, superou minhas expectativas. A entrega foi muito rápida!" },
            { user: "Fernanda M.", date: "05/09/2023", rating: 4, text: "Muito bom, mas achei um pouco pesado. De resto, funciona perfeitamente." },
            { user: "João P.", date: "20/08/2023", rating: 5, text: "Melhor custo benefício do mercado. Recomendo a todos." }
        ]
    };
    
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            let id = Number(params.get('id'));
            
            if (!id || isNaN(id)) {
                id = 1; 
            }
            
            this.loadProduct(id);
        });
    }
    
    loadProduct(id: number) {
        this.product = MOCK_PRODUCTS.find(p => p.id === id);
        
        if (this.product) {
            this.currentImage = this.product.images[0];
            this.quantity = 1;
            this.activeTab = 'overview';
            this.shippingResult = null;
        } else {
            this.toastr.error('Produto não encontrado', 'Erro');
        }
    }
    
    // --- Lógica Visual ---
    
    setActiveTab(tab: 'overview' | 'specs' | 'reviews') {
        this.activeTab = tab;
    }
    
    changeImage(img: string) {
        this.currentImage = img;
    }
    
    updateQty(delta: number) {
        const newVal = this.quantity + delta;
        if (newVal >= 1) {
            this.quantity = newVal;
        }
    }
    
    // --- Lógica de Zoom ---
    
    onMouseMove(e: MouseEvent) {
        const element = e.currentTarget as HTMLElement;
        const { left, top, width, height } = element.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        
        this.zoomOrigin = `${x}% ${y}%`;
        this.zoomTransform = 'scale(2)';
    }
    
    onMouseLeave() {
        this.zoomTransform = 'scale(1)';
        this.zoomOrigin = 'center center';
    }
    
    // --- Ações ---
    
    addToCart() {
        if (!this.product?.inStock) return;
        this.toastr.success(`Adicionado ${this.quantity}x ${this.product.name}`, 'Sucesso!');
    }
    
    calculateShipping() {
        if (this.zipCode.length < 8) {
            this.toastr.warning('Digite um CEP válido', 'Atenção');
            return;
        }
        
        this.shippingResult = [
            { type: 'Expresso (Sedex)', days: 2, price: 32.50 },
            { type: 'Econômica (PAC)', days: 7, price: 15.90 }
        ];
    }
    
    // Getters Auxiliares
    get finalPrice(): number {
        if (!this.product) return 0;
        return this.product.discount 
        ? this.product.price * (1 - this.product.discount / 100) 
        : this.product.price;
    }
    
    get discountValue(): number {
        return this.product ? Math.round(this.product.discount || 0) : 0;
    }
}