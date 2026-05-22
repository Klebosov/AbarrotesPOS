import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { productos, categorias } from '../data/productos';

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './todo.component.html',
  styleUrl: './todo.component.css'
})
export class TodoComponent {

  productos = productos;
  categorias = categorias;
  qrData: string = '';
  folio: string = '';
  fecha: string = '';

  carrito: any[] = [];

  categoriaSeleccionada = 'todo';
  busqueda = '';

  // =======================================================
  // CONSTRUCTOR MODIFICADO CON LA CORRECCIÓN DE SCROLL
  // =======================================================
  constructor() {
    this.cargarCarrito();
    
    // CORREGIDO: Mueve la pantalla automáticamente al borde superior (X=0, Y=0) al entrar
    window.scrollTo(0, 0); 
  }

  filtrarCategoria(cat: string) {
    this.categoriaSeleccionada = cat;
    this.filtrar();
  }

  BuscarProducto(texto: string) {
    this.busqueda = texto;
    this.filtrar();
  }

  filtrar() {
    this.productos = productos.filter(p => {
      const categoria =
        this.categoriaSeleccionada === 'todo' ||
        p.categoria === this.categoriaSeleccionada;

      const nombre =
        p.nombre.toLowerCase()
          .includes(this.busqueda.toLowerCase());

      return categoria && nombre;
    });
  }

  AgregarAlCarrito(producto: any) {
    const existe = this.carrito.find(
      item => item.id === producto.id
    );

    if (existe) {
      if (existe.cantidad < producto.stock) {
        existe.cantidad++;
        existe.subtotal =
          existe.cantidad * existe.precio;
      } else {
        alert('No hay suficiente stock');
      }
    } else {
      this.carrito.push({
        ...producto,
        cantidad: 1,
        subtotal: producto.precio
      });
    }

    this.guardarCarrito();
  }

  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.guardarCarrito();
  }

  aumentarCantidad(item: any) {
    if (item.cantidad < item.stock) {
      item.cantidad++;
      item.subtotal =
        item.cantidad * item.precio;
      this.guardarCarrito();
    } else {
      alert('Stock máximo alcanzado');
    }
  }

  disminuirCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad--;
      item.subtotal =
        item.cantidad * item.precio;
    } else {
      const index =
        this.carrito.indexOf(item);
      this.carrito.splice(index, 1);
    }
    this.guardarCarrito();
  }

  getTotal() {
    return this.carrito.reduce(
      (total, item) =>
        total + item.subtotal,
      0
    );
  }

  guardarCarrito() {
    localStorage.setItem(
      'carrito',
      JSON.stringify(this.carrito)
    );
  }

  cargarCarrito() {
    const data =
      localStorage.getItem('carrito');

    if (data) {
      this.carrito = JSON.parse(data);
    }
  }

  vaciarCarrito() {
    this.carrito = [];
    localStorage.removeItem('carrito');
  }

  async comprar() {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

    this.folio = 'TK-' + Date.now();
    this.fecha = new Date().toLocaleString();

    const infoQR = `
      Folio: ${this.folio}
      Total: $${this.getTotal()}
    `;

    this.qrData =
      await QRCode.toDataURL(infoQR);

    setTimeout(() => {
      JsBarcode(
        '#barcode',
        this.folio,
        {
          format: 'CODE128',
          displayValue: true
        }
      );

      this.imprimirTicket();
    }, 300);
  }

  imprimirTicket() {
    const contenido =
      document.getElementById('ticket')?.innerHTML;

    const ventana =
      window.open('', '', 'width=400,height=700');

    ventana?.document.write(`
      <html>
        <head>
          <title>Ticket</title>
          <style>
            body{
              font-family: Arial;
              padding:20px;
            }
            h2,h3,p{
              margin:5px 0;
            }
            hr{
              margin:10px 0;
            }
          </style>
        </head>
        <body>
          ${contenido}
        </body>
      </html>
    `);

    ventana?.document.close();
    ventana?.print();
    this.vaciarCarrito();
  }
}
