const mongoose = require("mongoose");

/**
 * Customer Schema
 * @typedef {Object} Customer
 * @property {number} id - Customer ID
 * @property {string} name - Customer name
 * @property {string} phone - Customer phone
 * @property {number} coupons - Number of available coupons (max: 10)
 */

const CustomerSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true }, // Keep the original ID
    name: { type: String, required: true },
    phone: { type: String, required: true },
    coupons: { type: Number, required: true, default: 0, min: 0, max: 10 },
},
    {collection: "customer"}
);

CustomerSchema.index({ id: 1 }); // Index for faster lookup by customer ID

module.exports = mongoose.model("Customer", CustomerSchema);
