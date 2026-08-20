import mongoose from 'mongoose'

const orderScheme = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    items: {
        type: Array,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    address: {
        type: Object,
        required: true
    },
    status: {
        type: String,
        default: "Food Processing"
    },
    date: {
        type: Date,
        default: Date.now()
    },
    payment: {
        type: Boolean,
        default: false
    },
    paymentMethod: {
        type: String,
        default: ""
    },
    paymentStatus: {
        type: String,
        default: "PENDING"
    },
    esewaTransactionUuid: {
        type: String,
        unique: true,
        sparse: true
    },
    esewaProductCode: {
        type: String
    },
    esewaReferenceId: {
        type: String
    }
})

const oredrModel = mongoose.models.order || mongoose.model("order", orderScheme);
export default oredrModel;
