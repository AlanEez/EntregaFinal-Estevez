import { Router } from 'express';
import cartModel from '../models/cart.model.js';
import productModel from '../models/product.model.js'; 

const router = Router();

//POST /api/carts - Crear un nuevo carrito vacío
router.post('/', async (req, res) => {
    try {
        const newCart = new cartModel({ products: [] }); // Carrito vacío
        await newCart.save();
        res.status(201).json({ status: "success", payload: newCart });
    } catch (error) {
        console.error("Error creating cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

//GET /api/carts/:cid - Obtener un carrito por ID
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const cart = await cartModel.findById(cid).populate('products.productId');
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }
        res.json({ status: "success", payload: cart });
    } catch (error) {
        console.error("Error fetching cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

//POST /api/carts/:cid/products/:pid - Agregar producto al carrito
router.post('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }

        const product = await productModel.findById(pid);
        if (!product) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }

        // Buscar si el producto ya está en el carrito
        const productInCart = cart.products.find(item => item.productId.toString() === pid);

        if (productInCart) {
            productInCart.quantity += quantity; // Aumentar cantidad
        } else {
            cart.products.push({ productId: pid, quantity });
        }

        await cart.save();
        res.json({ status: "success", payload: cart });
    } catch (error) {
        console.error("Error adding product to cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

//DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }

        cart.products = cart.products.filter(item => item.productId.toString() !== pid);
        await cart.save();

        res.json({ status: "success", payload: cart });
    } catch (error) {
        console.error("Error deleting product from cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

//PUT /api/carts/:cid - Actualizar un carrito con un nuevo array de productos
router.put('/:cid', async (req, res) => {
    const { cid } = req.params;
    const { products } = req.body; // Debe ser un array de productos

    try {
        const updatedCart = await cartModel.findByIdAndUpdate(cid, { products }, { new: true });
        if (!updatedCart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }
        res.json({ status: "success", payload: updatedCart });
    } catch (error) {
        console.error("Error updating cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

//PUT /api/carts/:cid/products/:pid - Actualizar cantidad de un producto en el carrito
router.put('/:cid/products/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body; // Nueva cantidad

    try {
        const cart = await cartModel.findById(cid);
        if (!cart) {
            return res.status(404).json({ status: "error", message: "Cart not found" });
        }

        const productInCart = cart.products.find(item => item.productId.toString() === pid);
        if (!productInCart) {
            return res.status(404).json({ status: "error", message: "Product not found in cart" });
        }

        productInCart.quantity = quantity; // Actualizar cantidad
        await cart.save();

        res.json({ status: "success", payload: cart });
    } catch (error) {
        console.error("Error updating product quantity in cart:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

//DELETE /api/carts/:cid - Eliminar un carrito
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const deletedCart = await cartModel.findByIdAndDelete(cid);
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
