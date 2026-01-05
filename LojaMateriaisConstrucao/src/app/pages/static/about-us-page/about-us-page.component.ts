import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Stat, Value } from '../../../shared/interfaces/AboutUs';

@Component({
    selector: 'app-about-us-page',
    imports: [CommonModule],
    templateUrl: './about-us-page.component.html',
    styleUrl: './about-us-page.component.css'
})

export class AboutUsPageComponent {
    // Dados de Estatísticas
    stats = signal<Stat[]>([
        { value: '50k+', label: 'Clientes Atendidos' },
        { value: '15k+', label: 'Produtos no Catálogo' },
        { value: '24h', label: 'Envio Expresso' },
        { value: '4.9', label: 'Nota Média (Reviews)' }
    ]);
    
    // Dados de Valores/Pilares
    values = signal<Value[]>([
        { 
            icon: 'ph-shield-check', 
            title: 'Confiança Absoluta', 
            description: 'Trabalhamos apenas com marcas certificadas e garantimos a procedência e qualidade de cada item vendido em nossa loja.',
            colorClass: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
        },
        { 
            icon: 'ph-truck', 
            title: 'Logística Ágil', 
            description: 'Sabemos que obra parada é prejuízo. Nossa logística é otimizada com centros de distribuição estratégicos para entregas recordes.',
            colorClass: 'bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white'
        },
        { 
            icon: 'ph-users-three', 
            title: 'Parceria Técnica', 
            description: 'Nosso suporte não é apenas comercial. Falamos a língua da engenharia para ajudar você a escolher a especificação correta.',
            colorClass: 'bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white'
        }
    ]);
}
