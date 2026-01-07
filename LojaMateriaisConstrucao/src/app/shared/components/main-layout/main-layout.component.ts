import { Component, inject, OnInit, signal } from '@angular/core';
import { FilterSidebarComponent } from "./filter-sidebar/filter-sidebar.component";
import { HeroCarouselComponent } from "./hero-carousel/hero-carousel.component";
import { GridHeaderComponent } from "./grid-header/grid-header.component";
import { ProductGridComponent } from './product-grid/product-grid.component';
import { EmptyStateComponent } from "./empty-state/empty-state.component";
import { Produto, ProdutoFiltro } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';
import { PageableParams } from '../../../models/shared.models';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-main-layout',
    imports: [FilterSidebarComponent, HeroCarouselComponent, GridHeaderComponent, ProductGridComponent, EmptyStateComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css'
})

export class MainLayoutComponent implements OnInit {
    private catalogoService = inject(CatalogoService);
    private route = inject(ActivatedRoute);
    
    // Dados de Produtos
    produtos = signal<Produto[]>([]);
    loading = signal(true);
    hasError = signal(false);
    
    // Estado da Paginação (Baseado no seu JSON de exemplo)
    totalItems = signal(0);
    totalPages = signal(0);
    currentPage = signal(0); // Começa em 0 (padrão Spring)
    pageSize = signal(12);   // Itens por página
    
    isMobileFilterOpen = signal(false);
    viewMode = signal<'grid' | 'list'>('grid');
    currentSort = signal(''); 
    currentFilter = signal<ProdutoFiltro | null>(null);
    
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const termo = params['termo'];
            if (termo) {
                this.currentFilter.set({
                    ...(this.currentFilter() || { precoMin: 0, precoMax: 10000, apenasAtivos: true }),
                    termo: termo
                });
            }
            this.carregarDados();
        });
    }
    
    carregarDados() {
        this.loading.set(true);
        this.hasError.set(false);
        
        const pageParams: PageableParams = { 
            page: this.currentPage(), 
            size: this.pageSize(), 
            sort: this.currentSort() 
        };
        
        const requisicao$ = this.currentFilter() 
        ? this.catalogoService.buscarProdutosComFiltro(this.currentFilter()!, pageParams)
        : this.catalogoService.listarProdutosVitrine(pageParams);
        
        requisicao$.subscribe({
            next: (response: any) => {
                // Mapeia os dados conforme o JSON fornecido (response.content e response.page)
                this.produtos.set(response.content);
                
                if (response.page) {
                    this.totalItems.set(response.page.totalElements);
                    this.totalPages.set(response.page.totalPages);
                    // O seu JSON mostra "number: 1" para a primeira página, mas o Spring usa 0-indexed. 
                    // Ajuste aqui se sua API for 1-indexed. Ex: this.currentPage.set(response.page.number - 1);
                    this.currentPage.set(response.page.number); 
                }
                
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar produtos', err);
                this.produtos.set([]);
                this.hasError.set(true);
                this.loading.set(false);
            }
        });
    }
    
    onPageChange(page: number) {
        this.currentPage.set(page);
        this.carregarDados();
    }
    
    aplicarFiltros(filtro: ProdutoFiltro) {
        this.currentFilter.set(filtro);
        this.currentPage.set(0); // Volta para primeira página ao filtrar
        this.carregarDados();
    }
    
    aplicarOrdenacao(sort: string) {
        this.currentSort.set(sort);
        this.currentPage.set(0);
        this.carregarDados();
    }
    
    alterarVisualizacao(mode: 'grid' | 'list') {
        this.viewMode.set(mode);
    }
}