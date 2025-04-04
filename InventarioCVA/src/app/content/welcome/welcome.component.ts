import { Component } from '@angular/core';
import { NavbarComponent } from '../shippets/navbar/navbar.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [NavbarComponent, RouterOutlet],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.css'
})
export class WelcomeComponent {

}
