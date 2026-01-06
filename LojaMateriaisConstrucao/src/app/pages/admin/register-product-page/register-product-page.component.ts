import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Categoria, ProdutoRequest } from '../../../models/catalogo.models';
import { CatalogoService } from '../../../services/catalogo.service';
import { TipoMovimentacao, MovimentacaoEstoqueRequest } from '../../../models/estoque.models';
import { EstoqueService } from '../../../services/estoque.service';
import { FileUploadService } from '../../../services/fileUpload.service';
import { HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-register-product-page',
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './register-product-page.component.html',
    styleUrl: './register-product-page.component.css'
})

export class RegisterProductPageComponent implements OnInit {
    private fb = inject(FormBuilder);
    private catalogoService = inject(CatalogoService);
    private estoqueService = inject(EstoqueService);
    private fileUploadService = inject(FileUploadService);
    private toastr = inject(ToastrService);
    private router = inject(Router);
    private route = inject(ActivatedRoute); 
    
    // Estados reativos
    isLoading = signal(false);
    isAdjustingStock = signal(false);
    isUploading = signal(false);
    isEditing = signal(false);
    showStockModal = signal(false);
    productId = signal<string | null>(null);
    categorias = signal<Categoria[]>([]);
    
    // Lista de URLs das imagens carregadas
    images = signal<string[]>([]);
    
    // Formulário Principal
    productForm: FormGroup = this.fb.group({
        codigoControle: ['', [Validators.required, Validators.minLength(3)]],
        titulo: ['', [Validators.required, Validators.minLength(3)]],
        descricao: ['', [Validators.required]],
        preco: [null, [Validators.required, Validators.min(0.01)]],
        precoPromocional: [null, [Validators.min(0)]],
        estoque: [0, [Validators.required, Validators.min(0)]],
        ativo: [true, Validators.required],
        categoriaId: ['', Validators.required],
        pesoKg: [null],
        dimensoes: ['']
    });
    
    // Formulário de Ajuste de Estoque
    stockForm: FormGroup = this.fb.group({
        quantidade: [1, [Validators.required, Validators.min(1)]],
        tipo: [TipoMovimentacao.ENTRADA, Validators.required],
        motivo: ['', [Validators.required, Validators.minLength(5)]]
    });
    
    ngOnInit() {
        this.carregarCategorias();
        
        this.route.queryParams.subscribe(params => {
            const id = params['id'];
            if (id) {
                this.productId.set(id);
                this.isEditing.set(true);
                this.carregarDadosProduto(id);
            }
        });
    }
    
    carregarCategorias() {
        this.catalogoService.listarCategoriasAtivas({ page: 0, size: 100 }).subscribe({
            next: (page) => this.categorias.set(page.content)
        });
    }
    
    carregarDadosProduto(id: string) {
        this.isLoading.set(true);
        this.catalogoService.obterProduto(id).subscribe({
            next: (produto) => {
                this.productForm.patchValue({
                    codigoControle: produto.codigoControle,
                    titulo: produto.titulo,
                    descricao: produto.descricao,
                    preco: produto.preco,
                    precoPromocional: produto.precoPromocional,
                    estoque: produto.estoque,
                    ativo: produto.ativo,
                    categoriaId: produto.categoria?.id,
                    pesoKg: produto.pesoKg,
                    dimensoes: produto.dimensoes
                });
                
                // Tratamento das imagens vindas do banco
                if (produto.imagens && produto.imagens.length > 0) {
                    const imagensProcessadas = produto.imagens.map(img => {
                        // Se não começar com http, assumimos que é um nome de arquivo e geramos a URL
                        return img.startsWith('http') 
                        ? img 
                        : this.fileUploadService.getPreviewUrl(img);
                    });
                    this.images.set(imagensProcessadas);
                }
                
                this.isLoading.set(false);
            },
            error: () => {
                this.toastr.error('Erro ao carregar dados do produto.');
                this.router.navigate(['/dashboard-admin/produtos']);
            }
        });
    }
    
    // --- Lógica de Upload REAL ---
    onFileSelected(event: any) {
        const files: FileList = event.target.files;
        if (files && files.length > 0) {
            this.isUploading.set(true);
            let uploadCount = 0;
            let successCount = 0;
            const totalFiles = files.length;
            
            for (let i = 0; i < totalFiles; i++) {
                const file = files[i];
                
                // Validação simples de tipo
                if (!file.type.startsWith('image/')) {
                    this.toastr.warning(`O arquivo ${file.name} não é uma imagem válida.`);
                    uploadCount++;
                    this.checkUploadComplete(uploadCount, totalFiles);
                    continue;
                }
                
                this.fileUploadService.upload(file).subscribe({
                    next: (httpEvent: any) => {
                        if (httpEvent instanceof HttpResponse) {
                            // Sucesso: Backend retornou o nome do arquivo (ex: uuid.jpg)
                            const fileName = httpEvent.body.fileName;
                            const fullUrl = this.fileUploadService.getPreviewUrl(fileName);
                            
                            // Adiciona ao signal de imagens
                            this.images.update(imgs => [...imgs, fullUrl]);
                            successCount++;
                            uploadCount++;
                            this.checkUploadComplete(uploadCount, totalFiles);
                        }
                    },
                    error: () => {
                        this.toastr.error(`Erro ao enviar a imagem ${file.name}`);
                        uploadCount++;
                        this.checkUploadComplete(uploadCount, totalFiles);
                    }
                });
            }
        }
    }
    
    private checkUploadComplete(current: number, total: number) {
        if (current === total) {
            this.isUploading.set(false);
            this.toastr.success('Processamento de imagens concluído!');
        }
    }
    
    removeImage(index: number) {
        this.images.update(imgs => imgs.filter((_, i) => i !== index));
    }
    
    // Salvar Produto com Imagens
    onSubmit() {
        if (this.productForm.invalid) {
            this.productForm.markAllAsTouched();
            this.toastr.warning('Preencha todos os campos obrigatórios.');
            return;
        }
        
        this.isLoading.set(true);
        const formValue = this.productForm.value;
        
        const request: ProdutoRequest = {
            codigoControle: formValue.codigoControle,
            titulo: formValue.titulo,
            descricao: formValue.descricao,
            preco: formValue.preco,
            precoPromocional: formValue.precoPromocional || undefined,
            estoque: formValue.estoque,
            ativo: formValue.ativo,
            categoriaId: formValue.categoriaId,
            pesoKg: formValue.pesoKg,
            dimensoes: formValue.dimensoes,
            // Enviamos as URLs completas. 
            // Nota: Se o seu backend preferir só o nome do arquivo, você pode fazer um .map() aqui para extrair.
            imagens: this.images() 
        };
        
        const operation$ = this.isEditing() && this.productId()
        ? this.catalogoService.atualizarProduto(this.productId()!, request)
        : this.catalogoService.salvarProduto(request);
        
        operation$.subscribe({
            next: () => {
                this.toastr.success(`Produto ${this.isEditing() ? 'atualizado' : 'cadastrado'} com sucesso!`);
                this.router.navigate(['/dashboard-admin/produtos']);
            },
            error: (err) => {
                this.toastr.error(err.error?.message || 'Erro ao processar solicitação.');
                this.isLoading.set(false);
            }
        });
    }
    
    // --- Outros Métodos (Estoque, Getters) mantidos ---
    
    openStockModal(product: any) { 
        this.stockForm.reset({ quantidade: 1, tipo: TipoMovimentacao.ENTRADA, motivo: '' });
        this.showStockModal.set(true);
    }
    
    confirmStockAdjustment() {
        if (this.stockForm.invalid || !this.productId()) {
            this.stockForm.markAllAsTouched();
            return;
        }
        
        this.isAdjustingStock.set(true);
        const val = this.stockForm.value;
        const request: MovimentacaoEstoqueRequest = {
            produtoId: this.productId()!,
            quantidade: val.quantidade,
            tipo: val.tipo,
            motivo: val.motivo
        };
        
        this.estoqueService.registrarMovimentacao(request).subscribe({
            next: () => {
                this.toastr.success('Estoque atualizado com sucesso!');
                this.stockForm.reset({ quantidade: 1, tipo: TipoMovimentacao.ENTRADA, motivo: '' });
                this.showStockModal.set(false);
                // Recarrega para atualizar a quantidade na tela
                this.carregarDadosProduto(this.productId()!);
            },
            error: (err) => this.toastr.error(err.error?.message || 'Erro ao ajustar estoque.'),
            complete: () => this.isAdjustingStock.set(false)
        });
    }
    
    get enumTipo() { return TipoMovimentacao; }
    
    isFieldInvalid(fieldName: string): boolean {
        const field = this.productForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
    
    isStockFieldInvalid(fieldName: string): boolean {
        const field = this.stockForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }
}