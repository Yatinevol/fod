import mongoose, { Schema, Types } from 'mongoose';

export interface Participant {
    userId: Types.ObjectId | string;
    username: string | undefined;
    totalFocusMinutes: number;
    targetHour: number;
}

export interface Session {
    sessionId: string;
    createdBy: Types.ObjectId | string;
    startTime: Date;
    endTime: Date; // Make required since you auto-end weekly sessions
    weeklyGoalHours: number; // Add this for clarity
    participants: Participant[];
    isActive: boolean; // Add this to track active sessions
}

export interface SessionDocument extends Session {
    _id: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ParticipantSchema = new Schema<Participant>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true },
    totalFocusMinutes: { type: Number, default: 0 },
    targetHour: { type: Number, required: true }
});

const SessionSchema = new Schema<SessionDocument>({
    sessionId: { type: String, required: true, unique: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date, required: true }, // Auto-calculated as end of week
    weeklyGoalHours: { type: Number, required: true },
    participants: { type: [ParticipantSchema], default: [] },
    isActive: { type: Boolean, default: true }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

export const Session = (mongoose.models.Session as mongoose.Model<SessionDocument>) || 
                       (mongoose.model("Session", SessionSchema));