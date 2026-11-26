import mongoose from "mongoose";

const connectDb = async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI);
        mongoose.set("debug",true);
        console.log(`MongoDb Connected !!`);
    }catch(error){
        console.log(`MongoDB error`);
        process.exit();
    }
};

export default connectDb;