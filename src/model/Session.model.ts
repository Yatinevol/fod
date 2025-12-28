import mongoose,{ Schema, Types } from 'mongoose';

export interface Participant {
    userId: Types.ObjectId | string;
    username: string;
    totalFocusMinutes: number;
    targetMinutes: number;
}

export interface Session {
    sessionId: string;
    allowOthers: boolean;
    createdBy: Types.ObjectId | string;
    startTime: Date;
    endTime?: Date;
    participants: Participant[];
}


export interface SessionDocument  {
    sessionId: string;
    allowOthers: boolean;
    createdBy: Types.ObjectId | string;
    startTime: Date;
    endTime?: Date;
    participants: Participant[];
}

const ParticipantSchema = new Schema<Participant>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    totalFocusMinutes: { type: Number, required: true },
    targetMinutes: { type: Number, required: true }
});


const SessionSchema = new Schema<SessionDocument>({
    sessionId: { type: String, required: true, unique: true },
    allowOthers: { type: Boolean, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: false },
    participants: { type: [ParticipantSchema], default: [] }
});

export const Session = (mongoose.models.Session as mongoose.Model<SessionDocument>) ||(mongoose.model("Session",SessionSchema))