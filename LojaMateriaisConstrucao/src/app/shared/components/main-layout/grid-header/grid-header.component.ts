import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-grid-header',
    imports: [CommonModule, FormsModule],
    templateUrl: './grid-header.component.html',
    styleUrl: './grid-header.component.css'
})

export class GridHeaderComponent {
    @Input() totalItems = 0;
    @Input() viewMode: 'grid' | 'list' = 'grid';
    
    // Eventos para o Pai (MainLayout)
    @Output() viewModeChange = new EventEmitter<'grid' | 'list'>();
    @Output() sortChange = new EventEmitter<string>();
    
    selectedSort = 'relevance';
    
    setView(mode: 'grid' | 'list') {
        this.viewMode = mode;
        this.viewModeChange.emit(mode); // Emite para o pai atualizar o sinal
    }
    
    onSortChange() {
        // Mapeia para o padrão do Spring Boot (campo,direção)
        // As propriedades devem bater com a Entidade Java (Produto.java)
        let sortParam = '';
        
        switch (this.selectedSort) {
            case 'low-high': 
            sortParam = 'preco,asc'; 
            break;
            case 'high-low': 
            sortParam = 'preco,desc'; 
            break;
            case 'name-asc': 
            sortParam = 'titulo,asc'; 
            break;
            case 'newest': 
            sortParam = 'dataCriacao,desc'; 
            break;
            default: 
            sortParam = ''; // Relevância (sem sort explícito)
        }
        
        this.sortChange.emit(sortParam);
    }
}
