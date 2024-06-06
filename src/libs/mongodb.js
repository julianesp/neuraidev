//libs\mongodb.js
import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Conectado a MongoDB");
  } catch (error) {
    console.log(error);
  }
};

export default connectMongoDB;
