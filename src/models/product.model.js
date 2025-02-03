import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    code: { type: String, required: true },
    price: { type: Number, required: true },
    status: { type: Boolean, required: true },
    stock: { type: Number, required: true },
    category: { type: String, required: true },
    available: { type: Boolean, required: true }, 
});

const productModel = mongoose.model('Product', productSchema);

export default productModel;
