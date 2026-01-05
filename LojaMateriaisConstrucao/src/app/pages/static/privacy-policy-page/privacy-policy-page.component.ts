import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
    selector: 'app-privacy-policy-page',
    imports: [CommonModule, RouterModule],
    templateUrl: './privacy-policy-page.component.html',
    styleUrl: './privacy-policy-page.component.css'
})

export class PrivacyPolicyPageComponent {
    lastUpdate = '28 de Dezembro de 2024';
}
