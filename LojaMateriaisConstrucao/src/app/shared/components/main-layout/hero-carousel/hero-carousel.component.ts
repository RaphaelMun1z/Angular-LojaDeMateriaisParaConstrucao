import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { HeroSlide } from '../../../interfaces/HeroSlide';

@Component({
    selector: 'app-hero-carousel',
    imports: [CommonModule],
    templateUrl: './hero-carousel.component.html',
    styleUrl: './hero-carousel.component.css'
})

export class HeroCarouselComponent implements OnInit, OnDestroy {
    currentSlide = 0;
    private intervalId: any;
    private isBrowser: boolean;
    
    slides: HeroSlide[] = [
        {
            image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2000&auto=format&fit=crop",
            badge: "Ofertas da Semana",
            title: "Reformar nunca foi <br> tão <span class='text-brand-500'>fácil e barato.</span>",
            description: "Encontre os melhores materiais com entrega rápida e os melhores preços do mercado.",
            cta: "Ver Ofertas",
            color: "brand"
        },
        {
            image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=2000&auto=format&fit=crop",
            badge: "Especial Pintura",
            title: "Dê vida nova <br> à <span class='text-blue-400'>sua casa.</span>",
            description: "Tintas premium, acessórios e tudo o que você precisa para renovar seus ambientes.",
            cta: "Comprar Tintas",
            color: "blue"
        },
        {
            image: "https://images.unsplash.com/photo-1581244277943-fe4a9c777189?q=80&w=2000&auto=format&fit=crop",
            badge: "Ferramentas Pro",
            title: "Equipamentos de <br> <span class='text-yellow-400'>alta performance.</span>",
            description: "Para profissionais exigentes. Furadeiras, serras e kits completos em promoção.",
            cta: "Ver Ferramentas",
            color: "yellow"
        }
    ];
    
    constructor(@Inject(PLATFORM_ID) platformId: Object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }
    
    ngOnInit() {
        if (this.isBrowser) {
            this.startTimer();
        }
    }
    
    ngOnDestroy() {
        this.stopTimer();
    }
    
    // --- Lógica de Navegação ---
    
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.resetTimer();
    }
    
    prevSlide() {
        this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
        this.resetTimer();
    }
    
    goToSlide(index: number) {
        this.currentSlide = index;
        this.resetTimer();
    }
    
    // --- Controle do Timer ---
    
    private startTimer() {
        this.intervalId = setInterval(() => {
            this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        }, 5000); // Muda a cada 5 segundos
    }
    
    private stopTimer() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }
    
    private resetTimer() {
        this.stopTimer();
        this.startTimer();
    }
}