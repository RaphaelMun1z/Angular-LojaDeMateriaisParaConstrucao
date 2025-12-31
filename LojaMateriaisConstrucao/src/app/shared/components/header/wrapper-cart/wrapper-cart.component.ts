import { Component } from '@angular/core';
import { ShoppingCartPopupComponent } from '../shopping-cart-popup/shopping-cart-popup.component';

@Component({
    selector: 'app-wrapper-cart',
    imports: [ShoppingCartPopupComponent],
    templateUrl: './wrapper-cart.component.html',
    styleUrl: './wrapper-cart.component.css'
})

export class WrapperCartComponent {
    
}
