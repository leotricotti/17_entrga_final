import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true, max: 100 },
  last_name: { type: String, required: true, max: 100 },
  email: { type: String, required: true, max: 100, unique: true },
  phone_number: { type: String, required: false, max: 100, default: "" },
  home_address: { type: String, required: false, max: 100, default: "" },
  zip_code: { type: String, required: false, max: 100, default: "" },
  state: { type: String, required: false, max: 100, default: "" },
  city: { type: String, required: false, max: 100, default: "" },
  password: { type: String, required: true, max: 100 },
  carts: {
    type: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "carts",
      },
    ],
  },
  role: {
    type: String,
    enum: ["user", "admin", "premium"],
    default: "user",
  },
  documents: {
    type: [
      {
        name: { type: String, required: true },
        reference: { type: String, required: true },
      },
    ],
  },
  last_connection: [
    {
      action: {
        type: String,
        required: true,
      },
    },
  ],
});

//Middleware para popular el carrito
userSchema.pre("find", function () {
  this.populate("carts.cart");
});

const User = mongoose.model(userCollection, userSchema);

export default User;
