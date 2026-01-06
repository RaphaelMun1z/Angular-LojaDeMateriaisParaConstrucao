import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { AuthService } from '../../../core/auth/auth.service';
import { Produto } from '../../../models/catalogo.models';
import { CarrinhoService } from '../../../services/carrinho.service';
import { CatalogoService } from '../../../services/catalogo.service';
import { FileUploadService } from '../../../services/fileUpload.service';

@Component({
    selector: 'app-product-page',
    imports: [CommonModule, FormsModule, RouterLink, NgxMaskDirective],
    providers: [provideNgxMask()],
    templateUrl: './product-page.component.html',
    styleUrl: './product-page.component.css'
})

export class ProductPageComponent implements OnInit {
    private route = inject(ActivatedRoute);
    private router = inject(Router);
    private toastr = inject(ToastrService);
    private catalogoService = inject(CatalogoService);
    private carrinhoService = inject(CarrinhoService);
    private authService = inject(AuthService);
    private fileUploadService = inject(FileUploadService); // Injetamos o serviço correto
    
    // Estado do Produto
    product = signal<Produto | null>(null);
    loading = signal(true);
    
    // Estado Visual
    productImages = signal<string[]>([]); 
    currentImage = signal<string>('');    
    activeTab = signal<'overview' | 'specs' | 'reviews'>('overview');
    quantity = signal(1);
    
    // Zoom
    zoomTransform = signal('scale(1)');
    zoomOrigin = signal('center center');
    
    // Frete
    zipCode = signal('');
    shippingResult = signal<null | { type: string, days: number, price: number }[]>(null);
    
    // Dados Extras (Mock)
    productExtras = {
        rating: 4.8,
        reviewsCount: 128,
        brand: 'NEXUS',
        specs: [
            { label: "Garantia", value: "12 meses do fabricante" },
            { label: "Conteúdo", value: "1 Unidade" },
            { label: "Material", value: "Alta Resistência" }
        ],
        reviews: [
            { user: "Carlos S.", date: "10/10/2023", rating: 5, text: "Produto excelente, superou minhas expectativas." },
            { user: "Fernanda M.", date: "05/09/2023", rating: 4, text: "Muito bom, funciona perfeitamente." },
            { user: "João P.", date: "20/08/2023", rating: 5, text: "Melhor custo benefício do mercado." }
        ]
    };
    
    finalPrice = computed(() => {
        const p = this.product();
        if (!p) return 0;
        return p.precoPromocional || p.preco;
    });
    
    discountPercentage = computed(() => {
        const p = this.product();
        if (!p || !p.precoPromocional) return 0;
        return Math.round(((p.preco - p.precoPromocional) / p.preco) * 100);
    });
    
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.loadProduct(id);
            } else {
                this.toastr.error('ID do produto inválido');
                this.router.navigate(['/']);
            }
        });
    }
    
    loadProduct(id: string) {
        this.loading.set(true);
        this.catalogoService.obterProduto(id).subscribe({
            next: (data) => {
                this.product.set(data);
                
                console.log(data)
                if (data.imagens && data.imagens.length > 0) {
                    const resolvedImages = data.imagens.map(img => {
                        // Verifica se é URL externa ou se precisa ser resolvida pelo serviço
                        return img.startsWith('http') ? img : this.fileUploadService.getPreviewUrl(img);
                    });
                    this.productImages.set(resolvedImages);
                    this.currentImage.set(resolvedImages[0]);
                } else {
                    const placeholder = 'https://placehold.co/600x600/f3f4f6/a1a1aa?text=Sem+Imagem';
                    this.productImages.set([placeholder]);
                    this.currentImage.set(placeholder);
                }
                
                this.quantity.set(1);
                this.loading.set(false);
            },
            error: (err) => {
                console.error(err);
                this.toastr.error('Produto não encontrado ou indisponível.');
                this.router.navigate(['/']);
            }
        });
    }
    
    setActiveTab(tab: 'overview' | 'specs' | 'reviews') {
        this.activeTab.set(tab);
    }
    
    changeImage(img: string) {
        this.currentImage.set(img);
    }
    
    updateQty(delta: number) {
        const newVal = this.quantity() + delta;
        if (newVal >= 1) {
            this.quantity.set(newVal);
        }
    }
    
    // Zoom Lógica
    onMouseMove(e: MouseEvent) {
        const element = e.currentTarget as HTMLElement;
        const { left, top, width, height } = element.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        
        this.zoomOrigin.set(`${x}% ${y}%`);
        this.zoomTransform.set('scale(2)');
    }
    
    onMouseLeave() {
        this.zoomTransform.set('scale(1)');
        this.zoomOrigin.set('center center');
    }
    
    addToCart() {
        const p = this.product();
        if (!p) return;
        
        if (p.estoque <= 0) {
            this.toastr.warning('Produto fora de estoque.');
            return;
        }
        
        if (!this.authService.isAuthenticated()) {
            this.toastr.info('Faça login para comprar.');
            this.router.navigate(['/auth/login']);
            return;
        }
        
        const userId = this.authService.currentUser()?.id;
        if (userId) {
            this.carrinhoService.adicionarItem(userId, p.id, this.quantity()).subscribe({
                next: () => this.toastr.success(`Adicionado ao carrinho!`),
                error: () => this.toastr.error('Erro ao adicionar.')
            });
        }
    }
    
    calculateShipping() {
        if (this.zipCode().length < 8) {
            this.toastr.warning('Digite um CEP válido');
            return;
        }
        this.shippingResult.set([
            { type: 'Expresso (Sedex)', days: 2, price: 32.50 },
            { type: 'Econômica (PAC)', days: 7, price: 15.90 }
        ]);
    }
}