import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/auth.service';
import { FileUploadService } from '../../../../services/fileUpload.service';
import { UsuarioService } from '../../../../services/usuario.service';
import { HttpEventType, HttpResponse } from '@angular/common/http';

@Component({
    selector: 'app-my-personal-data',
    imports: [CommonModule, FormsModule],
    templateUrl: './my-personal-data.component.html',
    styleUrl: './my-personal-data.component.css'
})
export class MyPersonalDataComponent implements OnInit {
    private authService = inject(AuthService);
    private fileUploadService = inject(FileUploadService);
    private usuarioService = inject(UsuarioService);
    private toastr = inject(ToastrService);
    
    isUploading = signal(false);
    isSaving = signal(false);
    
    // Objeto para bind do formulário (editável)
    formData = {
        nome: '',
        telefone: ''
    };
    
    // Signal para exibição (read-only e dados protegidos)
    user = signal({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        avatar: ''
    });
    
    constructor() {
        const currentUser = this.authService.currentUser();
        if (currentUser) {
            this.atualizarEstadoLocal(currentUser);
        }
    }
    
    ngOnInit() {
        this.usuarioService.getMe().subscribe({
            next: (dadosAtualizados) => {
                if (dadosAtualizados.avatar && !dadosAtualizados.avatar.startsWith('http')) {
                    dadosAtualizados.avatar = this.fileUploadService.getPreviewUrl(dadosAtualizados.avatar);
                }
                this.authService.updateUser(dadosAtualizados);
                this.atualizarEstadoLocal(dadosAtualizados);
            },
            error: (err) => console.error('Erro ao sincronizar perfil:', err)
        });
    }
    
    private atualizarEstadoLocal(dados: any) {
        const defaultAvatar = `https://ui-avatars.com/api/?name=${dados.email}&background=0D8ABC&color=fff&size=128`;
        
        // Atualiza o signal de visualização
        this.user.set({
            name: dados.nome || dados.name || dados.email?.split('@')[0],
            email: dados.email || '',
            cpf: dados.cpf || '',
            phone: dados.telefone || dados.phone || '',
            avatar: dados.avatar || defaultAvatar
        });
        
        // Atualiza os inputs do formulário
        this.formData = {
            nome: dados.nome || '',
            telefone: dados.telefone || ''
        };
    }
    
    savePersonalData(event: Event) {
        event.preventDefault();
        
        if (!this.formData.nome || this.formData.nome.length < 3) {
            this.toastr.warning('O nome deve ter pelo menos 3 caracteres.');
            return;
        }
        
        this.isSaving.set(true);
        
        this.usuarioService.atualizarMeusDados(this.formData).subscribe({
            next: () => {
                this.toastr.success('Dados atualizados com sucesso!');
                this.isSaving.set(false);
                
                // Atualiza o estado global para refletir o novo nome imediatamente
                const updatedUser = { ...this.authService.currentUser(), name: this.formData.nome };
                this.authService.updateUser(updatedUser);
                
                // Recarrega dados completos para garantir sincronia
                this.ngOnInit();
            },
            error: (err) => {
                this.toastr.error('Erro ao salvar alterações.');
                this.isSaving.set(false);
                console.error(err);
            }
        });
    }
    
    // --- Lógica de Upload (Mantida igual) ---
    onAvatarSelected(event: any) {
        const file: File = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.toastr.warning('Formato inválido.');
            return;
        }
        
        this.isUploading.set(true);
        
        this.fileUploadService.upload(file).subscribe({
            next: (httpEvent: any) => {
                if (httpEvent instanceof HttpResponse) {
                    const uploadedFileName = httpEvent.body.fileName;
                    this.usuarioService.atualizarMeuAvatar(uploadedFileName).subscribe({
                        next: () => {
                            const newAvatarUrl = this.fileUploadService.getPreviewUrl(uploadedFileName);
                            this.authService.updateUser({ avatar: newAvatarUrl });
                            this.user.update(u => ({ ...u, avatar: newAvatarUrl }));
                            this.toastr.success('Foto atualizada!');
                            this.isUploading.set(false);
                        },
                        error: () => {
                            this.toastr.error('Erro ao salvar foto.');
                            this.isUploading.set(false);
                        }
                    });
                }
            },
            error: () => {
                this.toastr.error('Falha no upload.');
                this.isUploading.set(false);
            }
        });
    }
    
    handleImageError(event: any) {
        const email = this.user().email;
        event.target.src = `https://ui-avatars.com/api/?name=${email}&background=0D8ABC&color=fff&size=128`;
    }
}