import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, inject, Input, OnInit, Output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-address-form',
    imports: [CommonModule, ReactiveFormsModule, NgxMaskDirective],
    providers: [provideNgxMask()],
    templateUrl: './address-form.component.html',
    styleUrl: './address-form.component.css'
})
export class AddressFormComponent implements OnInit {
    private fb = inject(FormBuilder);
    private http = inject(HttpClient);
    private toastr = inject(ToastrService);
    
    @Input() initialData: any = null; // Dados para edição
    @Output() save = new EventEmitter<any>();
    @Output() cancel = new EventEmitter<void>();
    
    isLoadingCep = signal(false);
    
    form: FormGroup = this.fb.group({
        apelido: ['', Validators.required],
        cep: ['', [Validators.required, Validators.minLength(8)]],
        logradouro: ['', Validators.required],
        numero: ['', Validators.required],
        complemento: [''],
        bairro: ['', Validators.required],
        cidade: ['', Validators.required],
        uf: ['', [Validators.required, Validators.maxLength(2)]],
        principal: [false]
    });
    
    ngOnInit() {
        if (this.initialData) {
            this.form.patchValue(this.initialData);
        }
    }
    
    buscarCep() {
        const cep = this.form.get('cep')?.value?.replace(/\D/g, '');
        if (!cep || cep.length !== 8) return;
        
        this.isLoadingCep.set(true);
        
        this.http.get<any>(`https://viacep.com.br/ws/${cep}/json/`).subscribe({
            next: (dados) => {
                if (dados.erro) {
                    this.toastr.warning('CEP não encontrado.');
                    this.form.get('cep')?.setErrors({ invalid: true });
                } else {
                    this.form.patchValue({
                        logradouro: dados.logradouro,
                        bairro: dados.bairro,
                        cidade: dados.localidade,
                        uf: dados.uf,
                        complemento: dados.complemento
                    });
                    this.toastr.success('Endereço encontrado!');
                }
            },
            error: () => this.toastr.error('Erro ao buscar CEP.'),
            complete: () => this.isLoadingCep.set(false)
        });
    }
    
    onSubmit() {
        if (this.form.valid) {
            this.save.emit(this.form.value);
        } else {
            this.form.markAllAsTouched();
        }
    }
}