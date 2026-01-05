import { Component, Input } from '@angular/core';
import { BRAND_CONFIG } from '../../../mocks/BRAND_CONFIG';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-footer',
    imports: [CommonModule],
    templateUrl: './footer.component.html',
    styleUrl: './footer.component.css'
})

export class FooterComponent {
    config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'light';
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
}
