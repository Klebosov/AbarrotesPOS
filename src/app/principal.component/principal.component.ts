import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { productos, categorias } from '../data/productos';

@Component({
  selector: 'app-principal',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit, OnDestroy {

  
  productos = productos;
  categorias = categorias;
  productosDestacados = productos.slice(0, 8);


  imagenesFondo: string[] = [
    'assets/Imagenes/Specias/Oregano.jpg',
    'assets/Imagenes/Lacteos/Queso Panela.jpg',
    'assets/Imagenes/Carnes/Res.jpg',
  ];
  
  indiceActivo: number = 0;
  intervaloId: any;

  
  ngOnInit() {
    this.iniciarCambioFondo();
  }

  
  ngOnDestroy() {
    if (this.intervaloId) {
      clearInterval(this.intervaloId);
    }
  }

  iniciarCambioFondo() {
    this.intervaloId = setInterval(() => {
      this.indiceActivo = (this.indiceActivo + 1) % this.imagenesFondo.length;
    }, 3500); 
  }
}
