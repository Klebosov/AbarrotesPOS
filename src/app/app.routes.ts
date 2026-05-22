import { Routes } from '@angular/router';


import { TodoComponent } from './todo.component/todo.component';
import { FAQComponent } from './faq.component/faq.component';
import { LoginComponent } from './login.component/login.component';
import { PrincipalComponent } from './principal.component/principal.component';
import { AdminComponent } from './admin.component/admin.component';
import { ProductoComponent } from './producto.component/producto.component';



export const routes: Routes = [
  { path: '', redirectTo: '/principal', pathMatch: 'full' }, // Cambia a otra ruta
  
  {path: 'todo', component: TodoComponent},
  {path: 'faq', component: FAQComponent},
  {path: 'login', component: LoginComponent},
  {path: 'principal', component: PrincipalComponent},
  {path: 'admin', component: AdminComponent},
  {path: 'producto/:id', component: ProductoComponent},
];