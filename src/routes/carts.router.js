// src/routes/carts.router.js
import { Router } from 'express';
import cartsModel from '../models/cart.model.js'; // Asegúrate de que la ruta sea correcta
import productModel from '../models/product.model.js'; // Importa el modelo de productos si es necesario

const router = Router();

// DELETE /api/carts/:cid/products/:pid
router.delete('/carts/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }
        cart.products = cart.products.filter(product => product.id !== pid);
        await cart.save();
        res.json({ status: "success", payload: cart });
    } catch (error) {
        console.error("Error deleting product from cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// PUT /api/carts/:cid
router.put('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const updatedCart = await cartsModel.findByIdAndUpdate(cid, { products: req.body.products }, { new: true });
        if (!updatedCart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }
        res.json({ status: "success", payload: updatedCart });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// PUT /api/carts/:cid/products/:pid
router.put('/carts/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body; // Asumiendo que se envía un cuerpo con la cantidad
    try {
        const cart = await cartsModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }
        const product = cart.products.find(product => product.id === pid);
        if (product) {
            product.quantity = quantity; // Actualiza la cantidad
            await cart.save();
            res.json({ status: "success", payload: cart });
        } else {
            res.status(404).json({ status: "error", message: "Product not found in cart" });
        }
    } catch (error) {
        console.error("Error updating product quantity in cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// DELETE /api/carts/:cid
router.delete('/carts/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const deletedCart = await cartsModel.findByIdAndDelete(cid);
        if (!deletedCart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }
        res.json({ status: "success", payload: deletedCart });
    } catch (error) {
        console.error("Error deleting cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

export default router;
