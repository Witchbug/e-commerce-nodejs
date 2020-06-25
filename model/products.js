const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    imgUrl: {
        type: String,
        required: true
    },
    userId : {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model("Product", productSchema);

// const mongodb = require('mongodb');
// const getDb = require('../util/database').getDb;

// class Product {
//     constructor(title, price, description, imgUrl, id, userId) {
//         this.title = title;
//         this.price = price;
//         this.description = description;
//         this.imgUrl = imgUrl;
//         this._id = id ? new mongodb.ObjectID(id) : null;
//         this.userId = userId;
//     }

//     save() {
//         const db = getDb();
//         let dbOp;
//         let message;
//         if(this._id) {
//             dbOp = db.collection('products').updateOne({ _id: this._id }, { $set: this });
//             message = 'Data updated';
//         } else {
//             dbOp = db.collection('products').insertOne(this);
//             message = 'Data has been added';
//         }
//         return dbOp
//         .then(result => {
//             return message;
//         })
//         .catch(err => {
//             console.log(err);
//         });
//     }

//     static fetchAll() {
//         const db = getDb();
//         return db.collection('products')
//             .find()
//             .toArray()
//             .then(products => {
//                 return products;
//             })
//             .catch(err => console.log(err));
//     }

//     static findById(id) {
//         const db = getDb();
//         return db.collection('products')
//         .find({ _id: new mongodb.ObjectID(id) })
//         .next()
//         .then(product => {
//             return product;
//         })
//         .catch(err => console.log(err));
//     }

//     static deleteById(id) {
//         const db = getDb();
//         return db.collection('products').deleteOne({ _id: new mongodb.ObjectID(id) })
//         .then(() => {
//             return 'Product has been deleted';
//         })
//         .catch(err => console.log(err));
//     }
        
// }

// module.exports = Product;