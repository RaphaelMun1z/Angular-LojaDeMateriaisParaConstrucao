import { Component } from '@angular/core';
import { CentralSearchBarComponent } from './central-search-bar/central-search-bar.component';
import { LogoMenuMobileTriggerComponent } from './logo-menu-mobile-trigger/logo-menu-mobile-trigger.component';
import { WrapperCartComponent } from "./wrapper-cart/wrapper-cart.component";
import { MyAccountAreaComponent } from "./my-account-area/my-account-area.component";

@Component({
    selector: 'app-header',
    imports: [CentralSearchBarComponent, LogoMenuMobileTriggerComponent, WrapperCartComponent, MyAccountAreaComponent],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})

export class HeaderComponent {
    
}
