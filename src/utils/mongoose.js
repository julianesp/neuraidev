import { connect, connection } from "mongoose";

const conn = {
  isConnected: false,
};

export async function connectedDB() {
    // para cuando se está conectado, no vuelvas a hacer una conexion
    if(conn.isConnected) return;

    const db = await connect(`mongodb://localhost:27017/neuraidevp`)
    console.log(db.connection.db.databaseName);
    conn.isConnected = db.connection[0].readyState;
}

connection.on('connected', () => {
    console.log('Mongoose está conectado');
})

connection.on('error', (err) => {
    console.log('Mongoose está desconectado', err);
})
