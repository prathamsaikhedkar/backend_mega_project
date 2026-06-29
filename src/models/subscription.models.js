import mongoose, { mongo } from "mongoose";

const subscriptionSchema = mongoose.Schema(
    {
        subscriber: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
        
    }, 
    {
        timestamps: true
    }
)

export const Subscription = mongoose.model("Subscription",subscriptionSchema)