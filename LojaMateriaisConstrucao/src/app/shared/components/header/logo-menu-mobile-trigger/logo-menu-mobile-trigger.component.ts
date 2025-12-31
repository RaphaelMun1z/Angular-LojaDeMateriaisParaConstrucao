import { Component, Input } from '@angular/core';
import { BRAND_CONFIG } from '../../../mocks/BRAND_CONFIG';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-logo-menu-mobile-trigger',
    imports: [CommonModule, RouterLink],
    templateUrl: './logo-menu-mobile-trigger.component.html',
    styleUrl: './logo-menu-mobile-trigger.component.css'
})

export class LogoMenuMobileTriggerComponent {
    config = BRAND_CONFIG;
    
    @Input() color: 'dark' | 'light' = 'dark';
    
    get fullName(): string {
        return `${this.config.namePrefix}${this.config.nameSuffix}`;
    }
}
