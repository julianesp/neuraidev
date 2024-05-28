import { connect, connection } from "mongoose";

const conn = {
  isConnected: false,
};

export async function connectedDB() {
    // para cuando se está conectado, no vuelvas a hacer una conexion
    if(conn.isConnected) return;

    const db = await connect('mongodb://localhost/neuraidev')

    // en la siguiente linea se llamar al nombre de la base por consola
    console.log(`Nombre de user: ${db.connection.db.databaseName}`);
    // readyState devuelve valores 0, 1
    // conn.isConnected = db.connection[0].readyState;
}   

connection.on('connected', () => {
    console.log('Mongoose está conectado');
})

connection.on('error', (err) => {
    console.log('Mongoose está desconectado', err);
})
