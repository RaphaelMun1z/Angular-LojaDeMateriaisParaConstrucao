import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { ProductPageComponent } from './pages/product-page/product-page.component';
import { CartPageComponent } from './pages/cart-page/cart-page.component';
import { FinalizePurchasePageComponent } from './pages/finalize-purchase-page/finalize-purchase-page.component';
import { PrivacyPolicyPageComponent } from './pages/privacy-policy-page/privacy-policy-page.component';
import { OrderPageComponent } from './pages/order-page/order-page.component';
import { OrderConfirmedPageComponent } from './pages/order-confirmed-page/order-confirmed-page.component';
import { ProfilePageComponent } from './pages/profile-page/profile-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { MyFavoriteProductsPageComponent } from './pages/my-favorite-products-page/my-favorite-products-page.component';
import { AboutUsPageComponent } from './pages/about-us-page/about-us-page.component';
import { RecoverPasswordPageComponent } from './pages/recover-password-page/recover-password-page.component';
import { DashboardAdminPageComponent } from './pages/admin/dashboard-admin-page/dashboard-admin-page.component';
import { LayoutWithHeaderComponent } from './pages/layouts/layout-with-header/layout-with-header.component';
import { NotFoundPageComponent } from './pages/not-found-page/not-found-page.component';
import { RegisterProductPageComponent } from './pages/admin/register-product-page/register-product-page.component';
import { RegisterCustomerPageComponent } from './pages/admin/register-customer-page/register-customer-page.component';
import { AdminOrdersPageComponent } from './pages/admin/admin-orders-page/admin-orders-page.component';
import { MainPageComponent } from './pages/admin/main-page/main-page.component';
import { AdministrativeReportsPageComponent } from './pages/admin/administrative-reports-page/administrative-reports-page.component';
import { adminGuard, authGuard } from './core/guards/auth.guard';
import { ForbiddenPageComponent } from './pages/forbidden-page/forbidden-page.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'inicio',
        pathMatch: 'full'
    },
    
    // --- Páginas com Layout Padrão ---
    {
        path: '',
        component: LayoutWithHeaderComponent,
        children: [
            // Rotas Públicas (Vitrine)
            { path: 'inicio', component: HomePageComponent },
            { path: 'produto/:id', component: ProductPageComponent },
            { path: 'carrinho', component: CartPageComponent },
            { path: 'faq', component: FaqPageComponent },
            { path: 'sobre-nos', component: AboutUsPageComponent },
            { path: 'politica-de-privacidade', component: PrivacyPolicyPageComponent },
            
            // Rotas Protegidas (Requer Login)
            { 
                path: 'finalizar-compra', 
                component: FinalizePurchasePageComponent,
                canActivate: [authGuard] 
            },
            { 
                path: 'pedido/:id', 
                component: OrderPageComponent, 
                canActivate: [authGuard]
            },
            { 
                path: 'pedido-confirmado', 
                component: OrderConfirmedPageComponent,
                canActivate: [authGuard]
            },
            { 
                path: 'perfil', 
                component: ProfilePageComponent,
                canActivate: [authGuard]
            },
            { 
                path: 'produtos-favoritos', 
                component: MyFavoriteProductsPageComponent,
                canActivate: [authGuard]
            },
        ]
    },
    
    // --- Páginas de Autenticação (Públicas) ---
    {
        path: 'login',
        component: LoginPageComponent
    },
    {
        path: 'registrar',
        component: RegisterPageComponent
    },
    {
        path: 'recuperar-senha',
        component: RecoverPasswordPageComponent
    },
    
    // --- Área Administrativa (Protegida) ---
    {
        path: 'dashboard-admin',
        component: DashboardAdminPageComponent,
        canActivate: [authGuard, adminGuard],
        children: [
            { path: '', component: MainPageComponent },
            { path: 'registrar-produto', component: RegisterProductPageComponent },
            { path: 'registrar-cliente', component: RegisterCustomerPageComponent },
            { path: 'pedidos', component: AdminOrdersPageComponent },
            { path: 'relatorios-administrativos', component: AdministrativeReportsPageComponent }
        ]
    },
    
    { 
        path: 'acesso-negado', 
        component: ForbiddenPageComponent
    },
    
    // Rota coringa (404)
    {
        path: '**',
        component: NotFoundPageComponent
    }
];