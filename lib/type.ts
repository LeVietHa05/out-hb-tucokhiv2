// User Data Types
export interface CurrentUser {
    id: string;
    name: string;
    role: string;
    last_access: string;
    fingerprint_status: string;
    positionFingerprint: number;
}

export interface User {
    id: string;
    name: string;
    role: string;
    last_access: string;
    fingerprint_status: string;
}

export interface Item {
    id: string;
    name: string;
    type: string;
    qr_code: string;
    borrowed_by: string;
}

export interface UserData {
    currentUser: CurrentUser;
    allUsers: User[];
    items: Item[];
    activityLogs: ActivityLog[]; // Thêm dòng này
    newEnrollPosition: number | null;
}

// Detection Data Types
export interface ImageDimensions {
    width: number;
    height: number;
}

export interface Prediction {
    width: number;
    height: number;
    x: number;
    y: number;
    confidence: number;
    class_id: number;
    class: string;
    detection_id: string;
    parent_id: string;
}

export interface PredictionsData {
    image: ImageDimensions;
    predictions: Prediction[];
}

export interface DetectionData {
    time: string;
    predictions: PredictionsData;
    imagePath: string;
}

// Export Row Interface
export interface ExportRow {
    category: string;
    id: string;
    name: string;
    type: string;
    details: string;
    timestamp: string;
    confidence?: number;
    position?: string;
    action?: string;
    user_id?: string;
    item_name?: string;
}

export interface ActivityLog {
    id: string;
    user_id: string;
    action: string;
    item_id: string;
    item_name: string;
    timestamp: string;
}