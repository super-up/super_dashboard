import { IUser } from "./user.types";

export interface ICall {
    _id: string;
    callerId: string | IUser;
    calleeId: string | IUser;
    roomId?: string;
    callStatus: CallStatus;
    callType: CallType;
    withVideo: boolean;
    startedAt?: string;
    endedAt?: string;
    duration?: number;
    createdAt: string;
    caller?: IUser;
    callee?: IUser;
}

export interface ICallWithDetails extends ICall {
    caller: IUser;
    callee: IUser;
}

export interface ICallStats {
    totalCalls: number;
    completedCalls: number;
    missedCalls: number;
    rejectedCalls: number;
    cancelledCalls: number;
    totalDuration: number;
    avgDuration: number;
    videoCalls: number;
    voiceCalls: number;
}

export interface IBulkUpdateCallsDto {
    callIds: string[];
    updates: ICallUpdates;
}

export interface ICallUpdates {
    deletedAt?: string | null;
}

export enum CallStatus {
    Ringing = "ringing",
    Accepted = "accepted",
    Rejected = "rejected",
    Missed = "missed",
    Cancelled = "cancelled",
    Ended = "ended",
    Busy = "busy",
    NoAnswer = "noAnswer",
}

export enum CallType {
    Single = "single",
    Group = "group",
}

export const getCallStatusLabel = (status: CallStatus): string => {
    switch (status) {
        case CallStatus.Ringing: return "Ringing";
        case CallStatus.Accepted: return "Accepted";
        case CallStatus.Rejected: return "Rejected";
        case CallStatus.Missed: return "Missed";
        case CallStatus.Cancelled: return "Cancelled";
        case CallStatus.Ended: return "Ended";
        case CallStatus.Busy: return "Busy";
        case CallStatus.NoAnswer: return "No Answer";
        default: return status;
    }
};

export const getCallStatusColor = (status: CallStatus): string => {
    switch (status) {
        case CallStatus.Ringing: return "processing";
        case CallStatus.Accepted:
        case CallStatus.Ended: return "success";
        case CallStatus.Rejected:
        case CallStatus.Cancelled: return "error";
        case CallStatus.Missed:
        case CallStatus.NoAnswer: return "warning";
        case CallStatus.Busy: return "default";
        default: return "default";
    }
};

export const formatCallDuration = (seconds: number | undefined): string => {
    if (!seconds || seconds <= 0) return "0:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

export const isCallCompleted = (call: ICall): boolean => {
    return call.callStatus === CallStatus.Ended || call.callStatus === CallStatus.Accepted;
};

export const isCallMissed = (call: ICall): boolean => {
    return call.callStatus === CallStatus.Missed || call.callStatus === CallStatus.NoAnswer;
};
