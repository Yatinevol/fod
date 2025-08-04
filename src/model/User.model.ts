import mongoose, {Schema} from "mongoose"


export interface User{
    username: string;
    email: string;
    password: string;

}

const UserSchema: Schema<User> = new Schema({
    username:{
        type: String,
        trim: true,
        unique: true,
        required: [true, "username is required"]
    },

    email : {
        type: String,
        unique: true,
        required: [true,"email is required"],
        match:[
            /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, "please use a valid email address"
        ]
    },

    password: {
        type: String,
        required:[true, "Password is required"]
    }
},{timestamps:true})


const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema)

export default UserModel