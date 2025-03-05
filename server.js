const express = require("express");
const exphbs = require("express-handlebars");
const hbsDateFormat = require("handlebars-dateformat");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const indexRoutes = require("./routes/index");
const customerRoutes = require("./routes/customers");
const deliveryRoutes = require("./routes/deliveries");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Set up Handlebars with a custom helper
app.engine(
    "hbs",
    exphbs.engine({
        extname: "hbs",
        helpers: {
            eq: function (a, b) {
                return a === b;
            },
            json: function (context) {
                return JSON.stringify(context);
            },
            formatDate: hbsDateFormat
        },
    })
);


app.set("view engine", "hbs");  // Set the view engine to 'hbs'

// Serve static files
app.use(express.static("public"));

// Middleware to parse form data
app.use(express.urlencoded({ extended: true }));

// Import routes
// app.use("/", indexRoutes);
app.use("/", customerRoutes);
app.use("/deliveries", deliveryRoutes);

// Start the server
const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
