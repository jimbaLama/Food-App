import mongoose from "mongoose";

export const connectDB = async () => {
    await mongoose.connect('mongodb+srv://jimbalama22_db_user:89hQaecWyycEmpEP@cluster0.qa3fvdm.mongodb.net/food-del').then(() => {
        console.log("Database Connected");
    })
}