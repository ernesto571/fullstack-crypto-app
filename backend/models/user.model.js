import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email:{
            type:String,
            required: true,
            unique: true
        },
        fullName:{
            type:String,
            required: true,
        },
        password:{
            type:String,
            required: true,
            minLength: 6
        },
        profilePic:{
            type:String,
            default: ''
        },
        watchlist: [
            {
              coinId: { type: String, required: true },
              name:   { type: String },
              price:  { type: Number },
            }
          ]
        
    },
    {timestamps: true}
)

const User = mongoose.model("User", userSchema)

export default User