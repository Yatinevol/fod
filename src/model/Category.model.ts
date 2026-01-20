import mongoose,{ Schema} from "mongoose";
import { User } from "./User.model";
import { Types } from "mongoose";


export interface CategoryI{
    name:string;
    userId: Types.ObjectId | User
    createdAt?: Date;
}

const CategorySchema = new Schema<CategoryI>({
    name: { 
        type: String, 
        required: true,
        //  unique: true
         }
    ,
    userId:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    }
    

},{timestamps:true})
CategorySchema.index(
  { name: 1, userId: 1 },
  { unique: true }
);

const CategoryModal = (mongoose.models.Category as mongoose.Model<CategoryI>) || mongoose.model<CategoryI>("Category",CategorySchema)

export default CategoryModal