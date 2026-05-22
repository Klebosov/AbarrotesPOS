export interface Usuario {
  uss: string;
  password: string;
  rol: 'admin' | 'user';
  faceDescriptor?: number[]; // Descriptor facial para reconocimiento
}

export const usuarios: Usuario[] = [
  {
    uss: "admin",
    password: "admin123",
    rol: "admin"
  },
  {
    uss: "usuario1",
    password: "pass123",
    rol: "user"
  },
  {
    uss: "juan",
    password: "juan123",
    rol: "user"
  },
  {
    uss: "maria",
    password: "maria123",
    rol: "user"
  }
];