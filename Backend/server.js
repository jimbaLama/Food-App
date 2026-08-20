import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import 'dotenv/config'
import cartRouter from './routes/cartRoute.js';
import orderRouter from './routes/orderRoute.js';
import CryptoJS from 'crypto-js'

// app config
const app = express();
// const port = 4000;

// Middleware
app.use(express.json());
app.use(cors());


// DB connection
connectDB();

// API endpoints
app.use("/api/food", foodRouter);
app.use("/images", express.static('uploads'));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter)

app.get("/", (req, res) => {
    res.send("API Working!");
})

app.post("/signature", (req, res) => {
    try {
        const {total_amount,transaction_uuid,product_code} = req.body;

        if (!total_amount || !transaction_uuid || !product_code) {
            return res.status(400).json({
                success: false,
                message: "total_amount, transaction_uuid, and product_code are required"
            });
        }

        if (!process.env.ESEWA_SECRET) {
            throw new Error("ESEWA_SECRET is not configured");
        }

        const hashString = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;

        const sign = CryptoJS.HmacSHA256(hashString, process.env.ESEWA_SECRET);
        const signature = CryptoJS.enc.Base64.stringify(sign);

        return res.json({
            success: true,
            signature
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })

    }
});

app.post("/verify", async (req, res) => {
    try {
        const {
            product_code,
            total_amount,
            transaction_uuid
        } = req.body;

        console.log({
            product_code,
            total_amount,
            transaction_uuid
        });

        const response = await fetch(
            `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${encodeURIComponent(product_code)}&total_amount=${encodeURIComponent(total_amount)}&transaction_uuid=${encodeURIComponent(transaction_uuid)}`
        );

        if (!response.ok) {
            throw new Error(`eSewa status check failed with HTTP ${response.status}`);
        }

        const result = await response.json();

        console.log("eSewa status:", result);

        if (result.status === "COMPLETE") {
            return res.json({
                success: true,
                data: result
            });
        }

        return res.json({
            success: false,
            data: result
        });

    } catch (error) {
        console.error("Verification error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on http://localhost:${process.env.PORT}`);
});
