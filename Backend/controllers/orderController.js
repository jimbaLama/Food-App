import oredrModel from "../models/orderModel.js";
import userModel from '../models/userModel.js'
import foodModel from '../models/foodModel.js'

// Create a pending order before redirecting the customer to eSewa. The server
// recalculates prices so payment totals cannot be changed in the browser.
const createEsewaOrder = async (req, res) => {
    try {
        const { items, address, transaction_uuid } = req.body;

        if (!Array.isArray(items) || items.length === 0 || !address || !transaction_uuid) {
            return res.status(400).json({ success: false, message: "Order details are incomplete" });
        }

        const itemIds = items.map((item) => item._id);
        const foods = await foodModel.find({ _id: { $in: itemIds } });
        const foodsById = new Map(foods.map((food) => [food._id.toString(), food]));

        const orderItems = items.map((item) => {
            const food = foodsById.get(item._id);
            const quantity = Number(item.quantity);

            if (!food || !Number.isInteger(quantity) || quantity <= 0) {
                throw new Error("Invalid food item or quantity");
            }

            return {
                _id: food._id,
                name: food.name,
                description: food.description,
                price: food.price,
                image: food.image,
                category: food.category,
                quantity
            };
        });

        const subtotal = orderItems.reduce((total, item) => total + item.price * item.quantity, 0);
        const deliveryCharge = subtotal > 0 ? 100 : 0;
        const totalAmount = subtotal + deliveryCharge;
        const productCode = process.env.ESEWA_PRODUCT_CODE || "EPAYTEST";

        const newOrder = await oredrModel.create({
            userId: req.body.userId,
            items: orderItems,
            amount: totalAmount,
            address,
            paymentMethod: "eSewa",
            paymentStatus: "PENDING",
            esewaTransactionUuid: transaction_uuid,
            esewaProductCode: productCode
        });

        return res.json({
            success: true,
            orderId: newOrder._id,
            payment: {
                amount: subtotal.toString(),
                tax_amount: "0",
                product_delivery_charge: deliveryCharge.toString(),
                product_service_charge: "0",
                total_amount: totalAmount.toString(),
                product_code: productCode,
                transaction_uuid
            }
        });
    } catch (error) {
        console.error("Error creating eSewa order:", error);
        return res.status(400).json({ success: false, message: "Could not create eSewa order" });
    }
};

// Do not trust the browser callback. Confirm the stored transaction with eSewa
// first, then mark only that matching order as paid.
const verifyEsewaPayment = async (req, res) => {
    try {
        const { product_code, total_amount, transaction_uuid } = req.body;
        const transactionUuid = String(transaction_uuid || "").trim();
        const productCode = String(product_code || "").trim();
        const totalAmount = Number(total_amount);
        const order = await oredrModel.findOne({ esewaTransactionUuid: transactionUuid });

        if (!order) {
            return res.status(400).json({ success: false, message: "No pending order was found for this eSewa transaction" });
        }

        if (order.esewaProductCode !== productCode) {
            return res.status(400).json({ success: false, message: "eSewa product code does not match the order" });
        }

        if (!Number.isFinite(totalAmount) || Number(order.amount) !== totalAmount) {
            return res.status(400).json({ success: false, message: "eSewa payment amount does not match the order" });
        }

        const response = await fetch(
            `https://rc.esewa.com.np/api/epay/transaction/status/?product_code=${encodeURIComponent(productCode)}&total_amount=${encodeURIComponent(totalAmount)}&transaction_uuid=${encodeURIComponent(transactionUuid)}`
        );

        if (!response.ok) {
            throw new Error(`eSewa status check failed with HTTP ${response.status}`);
        }

        const result = await response.json();
        console.log("eSewa payment status:", result);
        if (result.status !== "COMPLETE") {
            return res.json({ success: false, data: result });
        }

        const wasPaid = order.payment;
        order.payment = true;
        order.paymentStatus = "COMPLETE";
        order.esewaReferenceId = result.ref_id || result.refId || "";
        await order.save();

        if (!wasPaid) {
            await userModel.findByIdAndUpdate(order.userId, { cartData: {} });
        }

        return res.json({ success: true, data: result, orderId: order._id });
    } catch (error) {
        console.error("Error verifying eSewa payment:", error);
        return res.status(500).json({ success: false, message: "Could not verify eSewa payment" });
    }
};

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

export {createEsewaOrder, listOrders, updateStatus, userOrders, verifyEsewaPayment}
