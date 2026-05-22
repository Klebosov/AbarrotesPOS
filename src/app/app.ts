import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuComponent } from './menu.component/menu.component';
import { FooterComponent } from './foot.component/foot.component';
import { PrincipalComponent } from './principal.component/principal.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MenuComponent, FooterComponent, PrincipalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})


export class App {
  protected readonly title = signal('proy');
}
