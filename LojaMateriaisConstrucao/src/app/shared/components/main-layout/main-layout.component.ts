import { Component, inject, OnInit, signal } from '@angular/core';
import { FilterSidebarComponent } from "./filter-sidebar/filter-sidebar.component";
import { HeroCarouselComponent } from "./hero-carousel/hero-carousel.component";
import { GridHeaderComponent } from "./grid-header/grid-header.component";
import { ProductGridComponent } from './product-grid/product-grid.component';
import { EmptyStateComponent } from "./empty-state/empty-state.component";
import { Produto, ProdutoFiltro } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';
import { PageableParams } from '../../../models/shared.models';

@Component({
    selector: 'app-main-layout',
    imports: [FilterSidebarComponent, HeroCarouselComponent, GridHeaderComponent, ProductGridComponent, EmptyStateComponent],
    templateUrl: './main-layout.component.html',
    styleUrl: './main-layout.component.css'
})

export class MainLayoutComponent implements OnInit {
    private catalogoService = inject(CatalogoService);
    
    // Dados
    produtos = signal<Produto[]>([]);
    totalItems = signal(0); // Garante que comece com 0
    loading = signal(true);
    
    // Estado Visual
    isMobileFilterOpen = signal(false);
    viewMode = signal<'grid' | 'list'>('grid'); // O estado principal da visualização fica aqui
    
    // Estado da Busca
    currentSort = signal(''); 
    currentFilter = signal<ProdutoFiltro | null>(null);
    
    ngOnInit() {
        this.carregarDados();
    }
    
    carregarDados() {
        this.loading.set(true);
        
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
                // Atualiza o total com base no retorno do backend (totalElements é padrão do Spring Page)
                this.totalItems.set(page.totalElements ?? 0);
                this.loading.set(false);
            },
            error: (err) => {
                console.error('Erro ao carregar produtos', err);
                this.produtos.set([]);
                this.totalItems.set(0);
                this.loading.set(false);
            }
        });
    }
    
    aplicarFiltros(filtro: ProdutoFiltro) {
        this.currentFilter.set(filtro);
        this.isMobileFilterOpen.set(false);
        this.carregarDados();
    }
    
    aplicarOrdenacao(sort: string) {
        this.currentSort.set(sort);
        this.carregarDados();
    }
    
    // Este método é chamado quando o componente GridHeader emite o evento de troca
    alterarVisualizacao(mode: 'grid' | 'list') {
        this.viewMode.set(mode);
    }
}