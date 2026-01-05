import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/popup/toast/toast.component';
import { FooterComponent } from "./shared/components/layout/footer/footer.component";

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, ToastComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})

export class AppComponent {
    title = 'LojaMateriaisConstrucao';
}
