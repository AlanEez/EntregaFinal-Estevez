// src/routes/products.router.js
import { Router } from 'express';
import productModel from '../models/product.model.js';

const router = Router();

// GET /api/products
router.get('/products', async (req, res) => {
    let { limit = 10, page = 1, sort, categoria, minPrice, maxPrice, search } = req.query;
    limit = parseInt(limit);
    page = parseInt(page);

    try {
        // Construir filtro de búsqueda
        let filter = {};
        if (categoria) {
            filter.category = categoria; // Coincidir exactamente con la categoría
        }
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice); // Precio mínimo
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice); // Precio máximo
        }
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } }, // Búsqueda por nombre
                { description: { $regex: search, $options: 'i' } } // Búsqueda por descripción
            ];
        }

        // Opciones de ordenamiento
        let sortOptions = {};
        if (sort) {
            if (sort === 'name_asc') {
                sortOptions.name = 1; // Ordenar por nombre ascendente
            } else if (sort === 'name_desc') {
                sortOptions.name = -1; // Ordenar por nombre descendente
            } else if (sort === 'date_asc') {
                sortOptions.createdAt = 1; // Ordenar por fecha de creación ascendente
            } else if (sort === 'date_desc') {
                sortOptions.createdAt = -1; // Ordenar por fecha de creación descendente
            } else {
                sortOptions.price = sort === 'asc' ? 1 : -1; // Ordenar por precio
            }
        }

        // Obtener el total de productos que coinciden con el filtro
        const totalProducts = await productModel.countDocuments(filter);

        // Calcular la paginación
        const totalPages = Math.ceil(totalProducts / limit);
        const offset = (page - 1) * limit;

        // Obtener productos paginados
        const products = await productModel.find(filter)
            .sort(sortOptions)
            .skip(offset)
            .limit(limit);

        // Construir la respuesta
        const response = {
            status: "success",
            payload: products,
            totalPages,
            prevPage: page > 1 ? page - 1 : null,
            nextPage: page < totalPages ? page + 1 : null,
            page,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            prevLink: page > 1 ? `/api/products?limit=${limit}&page=${page - 1}&sort=${sort || ''}&categoria=${categoria || ''}&minPrice=${minPrice || ''}&maxPrice=${maxPrice || ''}&search=${search || ''}` : null,
            nextLink: page < totalPages ? `/api/products?limit=${limit}&page=${page + 1}&sort=${sort || ''}&categoria=${categoria || ''}&minPrice=${minPrice || ''}&maxPrice=${maxPrice || ''}&search=${search || ''}` : null
        };

        res.json(response);
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// POST /api/products
router.post('/products', async (req, res) => {
    try {
        const product = new productModel(req.body);
        await product.save();
        res.json({ status: "success", payload: product });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// PUT /api/products/:id
router.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const updatedProduct = await productModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedProduct) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }
        res.json({ status: "success", payload: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

// DELETE /api/products/:id
router.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const deletedProduct = await productModel.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ status: "error", message: "Product not found" });
        }
        res.json({ status: "success", payload: deletedProduct });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ status: "error", message: "Internal server error" });
    }
});

export default router;
