// app.js
import express from 'express';
import cartsRouter from './routes/carts.router.js';
import productsRouter from './routes/products.router.js';
import connectDB from './db.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 8080;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar a MongoDB
connectDB(); 

// Rutas
app.use('/api/carts', cartsRouter);
app.use('/api', productsRouter);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
