import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FaqItem } from '../../../shared/interfaces/FaqItem';

@Component({
    selector: 'app-faq-page',
    imports: [CommonModule, FormsModule],
    templateUrl: './faq-page.component.html',
    styleUrl: './faq-page.component.css'
})

export class FaqPageComponent {
    // Estado da Busca
    searchTerm = '';
    
    // Controle do Accordion (Armazena a pergunta aberta atualmente)
    openQuestion = signal<string | null>(null);
    
    // Dados Originais
    allFaqs: FaqItem[] = [
        {
            question: 'Qual o prazo de entrega?',
            answer: 'O prazo de entrega varia de acordo com o seu CEP e a modalidade de frete escolhida (Econômica ou Expressa). Você pode consultar o prazo exato na página do produto ou no carrinho de compras antes de finalizar o pedido.'
        },
        {
            question: 'Quais as formas de pagamento aceitas?',
            answer: 'Aceitamos cartão de crédito (em até 10x sem juros), boleto bancário e Pix com 5% de desconto. Pagamentos via Pix têm aprovação imediata e prioridade no processamento.'
        },
        {
            question: 'Como funciona a política de trocas?',
            answer: 'Você tem até 7 dias corridos após o recebimento para solicitar a troca ou devolução por arrependimento. Em casos de defeito, o prazo é de 30 dias para bens não duráveis e 90 dias para bens duráveis.'
        },
        {
            question: 'Os produtos possuem garantia?',
            answer: 'Sim! Todos os nossos produtos possuem garantia legal. Além disso, muitos itens como ferramentas elétricas possuem garantia estendida direto com o fabricante, que pode variar de 6 meses a 3 anos.'
        },
        {
            question: 'Entregam em todo o Brasil?',
            answer: 'Sim, realizamos entregas em todo o território nacional através de transportadoras parceiras e Correios, garantindo que seu material chegue em qualquer obra.'
        }
    ];
    
    // Lista Filtrada (Inicialmente igual a lista completa)
    filteredFaqs: FaqItem[] = [...this.allFaqs];
    
    // Lógica de Filtro
    filterFaqs() {
        if (!this.searchTerm.trim()) {
            this.filteredFaqs = [...this.allFaqs];
            return;
        }
        
        const term = this.searchTerm.toLowerCase();
        this.filteredFaqs = this.allFaqs.filter(item => 
            item.question.toLowerCase().includes(term) || 
            item.answer.toLowerCase().includes(term)
        );
    }
    
    // Lógica do Accordion
    toggleAccordion(item: FaqItem) {
        // Se clicar no que já está aberto, fecha. Se não, abre o novo.
        if (this.openQuestion() === item.question) {
            this.openQuestion.set(null);
        } else {
            this.openQuestion.set(item.question);
        }
    }
    
    isOpen(item: FaqItem): boolean {
        return this.openQuestion() === item.question;
    }
}
