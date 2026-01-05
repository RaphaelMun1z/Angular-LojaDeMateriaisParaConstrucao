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
    
    produtos = signal<Produto[]>([]);
    totalItems = signal(0);
    loading = signal(true);
    hasError = signal(false); // Novo estado de erro
    
    isMobileFilterOpen = signal(false);
    viewMode = signal<'grid' | 'list'>('grid');
    
    currentSort = signal(''); 
    currentFilter = signal<ProdutoFiltro | null>(null);
    
    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const termo = params['termo'];
            const filtroLocal = this.currentFilter();
            
            if (termo) {
                this.currentFilter.set({
                    ...(filtroLocal || { precoMin: 0, precoMax: 10000, apenasAtivos: true }),
                    termo: termo
                });
                this.carregarDados();
            } else {
                if (filtroLocal?.termo) {
                    const novoFiltro = { ...filtroLocal };
                    delete novoFiltro.termo;
                    this.currentFilter.set(novoFiltro);
                    this.carregarDados();
                } else if (this.produtos().length === 0) {
                    this.carregarDados();
                }
            }
        });
    }
    
    carregarDados() {
        this.loading.set(true);
        this.hasError.set(false); // Reseta erro ao tentar carregar
        
        const pageParams: PageableParams = { 
            page: 0, 
            size: 20, 
            sort: this.currentSort() 
        };
        
        const requisicao$ = this.currentFilter() 
        ? this.catalogoService.buscarProdutosComFiltro(this.currentFilter()!, pageParams)
        : this.catalogoService.listarProdutosVitrine(pageParams);
        
        requisicao$.subscribe({
            next: (page) => {
                this.produtos.set(page.content);
                this.totalItems.set(page.totalElements ?? 0);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar produtos', err);
                this.produtos.set([]);
                this.totalItems.set(0);
                this.hasError.set(true); // Ativa estado de erro
                this.loading.set(false);
            }
        });
    }
    
    // ... (restante dos métodos iguais: aplicarFiltros, aplicarOrdenacao, alterarVisualizacao)
    aplicarFiltros(filtro: ProdutoFiltro) {
        const termoUrl = this.route.snapshot.queryParams['termo'];
        if (termoUrl) {
            filtro.termo = termoUrl;
        }
        this.currentFilter.set(filtro);
        this.isMobileFilterOpen.set(false);
        this.carregarDados();
    }
    
    aplicarOrdenacao(sort: string) {
        this.currentSort.set(sort);
        this.carregarDados();
    }
    
    alterarVisualizacao(mode: 'grid' | 'list') {
        this.viewMode.set(mode);
    }
}