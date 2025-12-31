import { Component } from '@angular/core';
import { HeaderComponent } from "../../shared/components/header/header.component";
import { MainLayoutComponent } from "../../shared/components/main-layout/main-layout.component";
import { ToastComponent } from "../../shared/components/toast/toast.component";

@Component({
    selector: 'app-home-page',
    imports: [HeaderComponent, MainLayoutComponent, ToastComponent],
    templateUrl: './home-page.component.html',
    styleUrl: './home-page.component.css'
})

export class HomePageComponent {
    
}
