const mongoose = require("mongoose");

/**
 * Delivery Schema
 * @typedef {Object} Delivery
 * @property {Number} customer_id - Numeric Customer ID (from your data)
 * @property {Date} date - Delivery date (default: current date)
 * @property {Number} bottles_delivered - Number of bottles delivered
 */

const DeliverySchema = new mongoose.Schema({
    customer_id: { type: Number, required: true },
    date: { type: String, default: Date.now },
    bottles_delivered: { type: Number, required: true, default: 0 },
    },
    {collection: "delivery"}
);

DeliverySchema.index({ customer_id: 1, date: -1 }); // Index for fast retrieval sorted by date

module.exports = mongoose.model("Delivery", DeliverySchema);
