const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const orderSchema = new Schema({
    products: [
        {
            products: { type: Object, required: true },
            qty: { type: Number, required: true }
        }
    ],
    user: {
        userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' }
    }
});

module.exports = mongoose.model('Order', orderSchema);