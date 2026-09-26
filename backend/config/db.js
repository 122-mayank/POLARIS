import mongoose from "mongoose";

const connectDb = async()=>{
    try{
        const conn = await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser : true,
            useUnifiedTopology :true
        });
        console.log(`MongoDb Connected :${conn.connection.host}`);
        return conn;
    }catch(error){
        console.log(`MongoDB error :${error.message}`);
        process.exit(1);
    }
};

export default connectDb;