import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { productos } from '../data/productos';
import { categorias } from '../data/productos'; // cambia si lo separaste
import { usuarios } from '../data/uss';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html'
})
export class AdminComponent {

  tipoVista: string = 'productos';

  listaProductos = productos;
  listaCategorias = categorias;
  listaUsuarios = usuarios;

  editando: any = null;
  tipo: string = '';

  nuevoProducto: any = { id: '', nombre: '', precio: 0, descripcion: '', Image: '' };
  nuevaCategoria: any = { id: '', nombre: '' };
  nuevoUsuario: any = { uss: '', password: '', rol: 'user' };

  constructor() {
    this.cargarLocal();
  }

  // ================= GUARDAR LOCAL =================
  guardarLocal() {
    localStorage.setItem('productos', JSON.stringify(this.listaProductos));
    localStorage.setItem('categorias', JSON.stringify(this.listaCategorias));
    localStorage.setItem('usuarios', JSON.stringify(this.listaUsuarios));
  }

  cargarLocal() {
    const p = localStorage.getItem('productos');
    const c = localStorage.getItem('categorias');
    const u = localStorage.getItem('usuarios');

    if (p) this.listaProductos.splice(0, this.listaProductos.length, ...JSON.parse(p));
    if (c) this.listaCategorias.splice(0, this.listaCategorias.length, ...JSON.parse(c));
    if (u) this.listaUsuarios.splice(0, this.listaUsuarios.length, ...JSON.parse(u));
  }

  agregarProducto() {
    this.nuevoProducto.id = Date.now().toString();
    this.listaProductos.push({ ...this.nuevoProducto });
    this.nuevoProducto = { id: '', nombre: '', precio: 0, descripcion: '', Image: '' };
    this.guardarLocal();
  }

  editarProducto(p: any) {
    this.editando = p;
    this.tipo = 'producto';
  }

  eliminarProducto(id: string) {
    const i = this.listaProductos.findIndex(p => p.id === id);
    if (i !== -1) this.listaProductos.splice(i, 1);
    this.guardarLocal();
  }

  agregarCategoria() {
    this.nuevaCategoria.id = Date.now().toString();
    this.listaCategorias.push({ ...this.nuevaCategoria });
    this.nuevaCategoria = { id: '', nombre: '' };
    this.guardarLocal();
  }

  editarCategoria(c: any) {
    this.editando = c;
    this.tipo = 'categoria';
  }

  eliminarCategoria(id: string) {
    const i = this.listaCategorias.findIndex(c => c.id === id);
    if (i !== -1) this.listaCategorias.splice(i, 1);
    this.guardarLocal();
  }

  agregarUsuario() {
    this.listaUsuarios.push({ ...this.nuevoUsuario });
    this.nuevoUsuario = { uss: '', password: '', rol: 'user' };
    this.guardarLocal();
  }

  editarUsuario(u: any) {
    this.editando = u;
    this.tipo = 'usuario';
  }

  eliminarUsuario(uss: string) {
    const i = this.listaUsuarios.findIndex(u => u.uss === uss);
    if (i !== -1) this.listaUsuarios.splice(i, 1);
    this.guardarLocal();
  }

  cancelar() {
    this.editando = null;
  }
}