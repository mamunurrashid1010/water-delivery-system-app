const express = require("express");
const router = express.Router();
const Delivery = require("../models/Delivery");
const Customer = require("../models/Customer");

/**
 * @route GET /deliveries
 * @desc Show all deliveries for a specific date
 */
router.get("/", async (req, res) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).send("Please provide a date.");
        }

        const deliveries = await Delivery.find({ date: date }).exec();
        const customerIds = [...new Set(deliveries.map(delivery => delivery.customer_id))];
        const customers = await Customer.find({ id: { $in: customerIds } }).exec();
        const deliveriesWithCustomerInfo = deliveries.map(delivery => {
            const customer = customers.find(c => c.id === delivery.customer_id);
            return {
                ...delivery.toObject(),
                customer: customer ? { name: customer.name, phone: customer.phone } : null
            };
        });

        // res.send(deliveriesWithCustomerInfo);

        res.render("delivery-summary", { date, deliveriesWithCustomerInfo });
    } catch (err) {
        res.status(500).send("Error fetching deliveries.");
    }
});

/**
 * @route POST /deliveries/add
 * @desc Add a new delivery
 */
router.post("/add", async (req, res) => {
    try {
        const { customer } = req.body;
        const newDelivery = new Delivery({ customer, date: new Date() });
        await newDelivery.save();
        res.redirect("/deliveries");
    } catch (err) {
        res.status(500).send("Error adding delivery");
    }
});

/**
 * @route GET /deliveries?date=YYYY-MM-DD
 * @desc Get deliveries by date (query parameter)
 */
router.get("/date", async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) return res.status(400).json({ error: "Date query parameter is required" });

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const deliveries = await Delivery.find({ date: { $gte: startDate, $lte: endDate } })
            .populate("customer")
            .sort({ date: -1 });

        res.json(deliveries);
    } catch (err) {
        res.status(500).json({ error: "Error fetching deliveries" });
    }
});

/**
 * @route POST /deliveries
 * @desc Create a new delivery and reduce customer coupons
 */
router.post("/", async (req, res) => {
    try {
        const { customerId } = req.body;
        const customer = await Customer.findOne({ id: customerId });

        if (!customer) return res.status(404).json({ error: "Customer not found" });
        if (customer.coupons <= 0) return res.status(400).json({ error: "No coupons available" });

        // Reduce coupon count and save
        customer.coupons -= 1;
        await customer.save();

        // Create delivery record
        const newDelivery = new Delivery({ customer: customer._id });
        await newDelivery.save();

        res.redirect("/");
    } catch (err) {
        res.status(500).json({ error: "Error creating delivery" });
    }
});

module.exports = router;
