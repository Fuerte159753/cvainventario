import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { WelcomeComponent } from './content/welcome/welcome.component';

export const routes: Routes = [
    {path: 'Login', component: LoginComponent},
    {path:'', redirectTo: 'Login', pathMatch: 'full'},
    {path: 'Welcome', component: WelcomeComponent}
];
