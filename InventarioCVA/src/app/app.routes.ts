import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './content/welcome/welcome.component';
import { InicioComponent } from './content/inicio/inicio.component';
import { ErrorComponent } from './error/error.component';
import { ProductsComponent } from './content/products/products.component';
import { ExistenciaComponent } from './content/existencia/existencia.component';
import { ClientesComponent } from './content/clientes/clientes.component';
import { ProveedoresComponent } from './content/proveedores/proveedores.component';
import { PerfilComponent } from './content/perfil/perfil.component';
import { authGuard } from './guard/guard.guard';

export const routes: Routes = [
    {path: 'Login', component: LoginComponent},
    {path:'', redirectTo: 'Login', pathMatch: 'full'},
    {path: 'Welcome', component: WelcomeComponent, canActivate: [authGuard], children:[
        {path: 'Inicio', component: InicioComponent},
        {path: '', redirectTo: 'Inicio', pathMatch: 'full'},
        { path: 'Productos', component: ProductsComponent},
        { path: 'Existencia', component: ExistenciaComponent},
        { path: 'Clientes', component:ClientesComponent},
        { path: 'Proveedores', component: ProveedoresComponent},
        { path: 'Perfil', component:PerfilComponent}
    ]},
    { path: '**', component:ErrorComponent}
];
