import { CategoryI } from "@/model/Category.model";

export interface ApiResponse{
    success : boolean;
    message : string;
    date? : string;
    title? : string;
    category? : string;
    categories?: CategoryI[];
    data?: any
}