import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterState } from '../../../interfaces/FilterState';
import { FILTER_OPTIONS } from '../../../mocks/FILTER_OPTIONS';
import { NgxSliderModule, Options } from '@angular-slider/ngx-slider';

@Component({
    selector: 'app-filter-sidebar',
    imports: [CommonModule, FormsModule, NgxSliderModule],
    templateUrl: './filter-sidebar.component.html',
    styleUrl: './filter-sidebar.component.css'
})

export class FilterSidebarComponent {
    options = FILTER_OPTIONS;
    
    sliderOptions: Options = {
        floor: 0,
        ceil: 5000,
        step: 10,
        showTicks: false
    };
    
    sections = {
        categories: true,
        price: true,
        brands: true,
        availability: true,
        rating: true
    };
    
    filters: FilterState = {
        categories: [],
        brands: [],
        minPrice: 0,
        maxPrice: 5000,
        inStock: false,
        onSale: false,
        rating: 'all'
    };
    
    @Output() filterChange = new EventEmitter<FilterState>();
    @Output() close = new EventEmitter<void>();
    
    toggleSection(section: keyof typeof this.sections) {
        this.sections[section] = !this.sections[section];
    }
    
    onArrayFilterChange(event: Event, type: 'categories' | 'brands', value: string) {
        const isChecked = (event.target as HTMLInputElement).checked;
        
        if (isChecked) {
            this.filters[type].push(value);
        } else {
            this.filters[type] = this.filters[type].filter(item => item !== value);
        }
        this.emitFilters();
    }
    
    onFilterChange() {
        this.emitFilters();
    }
    
    resetFilters() {
        this.filters = {
            categories: [],
            brands: [],
            minPrice: 0,
            maxPrice: 5000,
            inStock: false,
            onSale: false,
            rating: 'all'
        };
        this.emitFilters();
    }
    
    private emitFilters() {
        this.filterChange.emit({ ...this.filters });
    }
}