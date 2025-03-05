const express = require("express");
const router = express.Router();
const Customer = require("../models/Customer");
const Delivery = require("../models/Delivery");

/**
 * @route GET /
 * @desc Get all customers
 */
router.get("/", async (req, res) => {
    try {
        const customers = await Customer.find().lean();
        res.render("customers", { title: "Customers", customers });
    } catch (err) {
        res.status(500).json({ error: "Error fetching customers" });
    }
});

/**
 * @route GET /customer-details/:id
 * @desc Show customer details and delivery history
 */
router.get("/customer-details/:id", async (req, res) => {
    try {
        const customer = await Customer.findOne({ id: req.params.id });
        if (!customer) return res.status(404).send("Customer not found.");

        const deliveries = await Delivery.find({ customer_id: customer.id })
            .sort({ date: -1 }) // Most recent first
            .exec();
        // res.render("customer-detail", { customer, deliveries });
        res.render("customer-detail", {
            customer: customer.toObject(),
            deliveries: deliveries.map(delivery => delivery.toObject())
        });

    } catch (err) {
        res.status(500).send("Error fetching customer details.");
    }
});


/**
 * @route POST /add
 * @desc Create a new customer
 */
router.post("/add", async (req, res) => {
    try {
        const { id, name, phone, coupons } = req.body;
        if (!id || !name || !phone) {
            return res.status(400).json({ error: "All fields are required" });
        }
        const newCustomer = new Customer({ id, name, phone, coupons: coupons || 0 });
        await newCustomer.save();
        //res.status(201).json(newCustomer);
        res.redirect("/");
    } catch (err) {
        res.status(500).json({ error: "Error creating customer" });
    }
});

/**
 * @route POST /:id/add-coupon
 * @desc Add 10 coupons (max 10)
 */
router.post("/:id/add-coupon", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).send("Customer not found.");

        if (customer.coupons >= 10) {
            return res.render('error', { error: 'Max coupons reached' });
        }

        if (customer.coupons < 10) {
            customer.coupons = Math.min(customer.coupons + 10, 10);
            await customer.save();
        }

        res.redirect("/");
    } catch (err) {
        res.status(500).send("Error updating coupons.");
    }
});


/**
 * @route PUT /:id/coupons
 * @desc Increase coupons (max 10)
 */
router.put("/:id/coupons", async (req, res) => {
    try {
        const customer = await Customer.findOne({ id: req.params.id });
        if (!customer) return res.status(404).json({ error: "Customer not found" });

        if (customer.coupons >= 10) {
            return res.status(400).json({ error: "Max coupons reached" });
        }

        customer.coupons = Math.min(10, customer.coupons + 10);
        await customer.save();
        res.redirect("/");
    } catch (err) {
        res.status(500).json({ error: "Error updating coupons" });
    }
});


/**
 * @route POST /:id/deliver
 * @desc Reduce 1 coupon and record delivery
 */
router.post("/:id/deliver", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id);
        if (!customer) return res.status(404).send("Customer not found.");

        if (customer.coupons > 0) {
            customer.coupons -= 1;
            await customer.save();

            const newDelivery = new Delivery({ customer_id: customer.id, date: new Date().toISOString().split('T')[0], bottles_delivered: 1 });
            await newDelivery.save();
        }

        res.redirect("/");
    } catch (err) {
        res.status(500).send("Error processing delivery.");
    }
});


module.exports = router;
