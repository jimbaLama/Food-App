import oredrModel from "../models/orderModel.js";
import userModel from '../models/userModel.js'
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Placing user order for frontend
const placeOrder = async (req, res) => {
    const frontend_url = 'http://localhost:5173';
    try{
        const newOrder = new oredrModel({
            userId: req.body.userId,
            items: req.body.items,
            amount: req.body.amount,
            address: req.body.address
        })
        await newOrder.save();
        await userModel.findByIdAndUpdate(req.body.userId, {cartData:{}});

        const line_items = req.body.items.map((item) => ({
            price_data: {
                currency: "npr",
                product_data: {
                    name: item.name
                },
                unit_amount: Math.round(item.price * 100)
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency: "npr",
                product_data: {
                    name: "Delivery Charges"
                },
                unit_amount: Math.round(100 * 100)
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            line_items: line_items,
            mode: 'payment',
            success_url: `${frontend_url}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${frontend_url}/verify?success=false&orderId=${newOrder._id}`,
        })

        res.json({
            success: true,
            session_url: session.url
        })
    } catch(err) {
        console.log(err);
        res.json({
            success: false,
            message: "Error try again!"
        })
        
    }
}

const verifyOrder = async (req, res) => {
    const {orderId, success} = req.body;
    try {
        if(success==='true') {
            await oredrModel.findByIdAndUpdate(orderId,{payment:true});
            res.json({
                success: true,
                message: "Paid"
            })
        } else {
            await oredrModel.findByIdAndDelete(orderId);
            res.json({
                success: false,
                message: "Not Paid"
            })
        }
    } catch (err) {
        console.log(err);
        res.json({
            success: false,
            message: "Error!"
        })
    }
}

// User orders for frontend
const userOrders = async (req, res) => {
    try {
        const orders = await oredrModel.find({userId: req.body.userId});
        res.json({
            success: true,
            data: orders
        })
    } catch(err) {
        console.log(err);
        res.json({
            success: false,
            message: "Error!"
        })
    }
}

// List order for admin panel
const listOrders = async (req, res) => {
    try {
        const orders = await oredrModel.find({});
        res.json({
            success: true,
            data: orders
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error!"
        })
    }
}

// api for updating order status
const updateStatus = async (req, res) => {
    try {
        await oredrModel.findByIdAndUpdate(req.body.orderId, {status:req.body.status});
        res.json({
            success: true,
            message: "Status Updated"
        })
    } catch (error) {
        console.log(error);
        res.json({
            success: false,
            message: "Error!"
        })
    }
}

export {placeOrder, verifyOrder, userOrders, listOrders, updateStatus}