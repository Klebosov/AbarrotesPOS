import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.css']
})
export class MenuComponent implements OnInit, OnDestroy {
  menuAbierto: boolean = false;
  logueado: boolean = false;
  
  
  carritoAbierto: boolean = false; 
  carrito: any[] = [];
  
  
  qrData: string = '';
  folio: string = '';
  fecha: string = '';

  private listenerStorage!: () => void;

  ngOnInit() {
    this.cargarCarrito();
    
  
    this.listenerStorage = () => this.cargarCarrito();
    window.addEventListener('storage', this.listenerStorage);
  }

  ngOnDestroy() {
    window.removeEventListener('storage', this.listenerStorage);
  }

  toggleMenu() {
    this.menuAbierto = !this.menuAbierto;
  }

  toggleCarrito() {
    this.carritoAbierto = !this.carritoAbierto;
    if (this.carritoAbierto) {
      this.cargarCarrito();
    }
  }

  
  eliminarDelCarrito(index: number) {
    this.carrito.splice(index, 1);
    this.guardarCarrito();
  }

  aumentarCantidad(item: any) {
    if (item.cantidad < item.stock) {
      item.cantidad++;
      item.subtotal = item.cantidad * item.precio;
      this.guardarCarrito();
    } else {
      alert('Stock máximo alcanzado');
    }
  }

  disminuirCantidad(item: any) {
    if (item.cantidad > 1) {
      item.cantidad--;
      item.subtotal = item.cantidad * item.precio;
    } else {
      const index = this.carrito.indexOf(item);
      this.carrito.splice(index, 1);
    }
    this.guardarCarrito();
  }

  getTotal() {
    return this.carrito.reduce((total, item) => total + item.subtotal, 0);
  }

  guardarCarrito() {
    localStorage.setItem('carrito', JSON.stringify(this.carrito));
    // Notifica de manera forzada al sistema de ventanas del navegador
    window.dispatchEvent(new Event('storage'));
  }

  cargarCarrito() {
    const data = localStorage.getItem('carrito');
    this.carrito = data ? JSON.parse(data) : [];
  }

  vaciarCarrito() {
    this.carrito = [];
    localStorage.removeItem('carrito');
    window.dispatchEvent(new Event('storage'));
  }

 
  async comprar() {
    if (this.carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }

   
    this.folio = 'TK-' + Date.now();
    this.fecha = new Date().toLocaleString();

    const infoQR = `Folio: ${this.folio}\nTotal: $${this.getTotal()}`;
    
    try {
      
      this.qrData = await QRCode.toDataURL(infoQR);
    } catch (err) {
      console.error('Error al generar código QR:', err);
    }

    
    setTimeout(() => {
      try {
        JsBarcode('#barcodeMenu', this.folio, {
          format: 'CODE128',
          displayValue: true,
          width: 2,
          height: 40
        });
      } catch (err) {
        console.error('Error al generar código de barras:', err);
      }

      
      this.imprimirTicket();
    }, 350);
  }

 
imprimirTicket() {
  const contenido = document.getElementById('ticketMenu')?.innerHTML;
  const ventana = window.open('', '', 'width=400,height=700');

  ventana?.document.write(`
    <html>
      <head>
        <title>Ticket</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
          h2, h3, p { margin: 5px 0; }
          hr { margin: 10px 0; border: 1px dashed #000; }
          table { width: 100%; border-collapse: collapse; text-align: left; }
          .text-right { text-align: right; }
        </style>
      </head>
      <body>
        ${contenido}
      </body>
    </html>
  `);

  ventana?.document.close();

  
  this.vaciarCarrito();
  this.carritoAbierto = false;

  
  setTimeout(() => {
    ventana?.print();
  }, 100);
}

  abrirLogin() { alert('Abrir login'); }
  abrirRegistro() { alert('Abrir registro'); }
  cerrarSesion() { this.logueado = false; this.menuAbierto = false; }
}
