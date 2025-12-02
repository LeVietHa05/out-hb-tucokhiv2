interface State {
  event: string;
  code: number;
  data: string;
  time: string;
  positionNumber?: number | null;
}

interface Item {
  id: string;
  name: string;
  type: string;
  qr_code: string;
  borrowed_by: string | null;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action: "borrow" | "return";
  item_id: string;
  item_name: string;
  timestamp: string;
}
interface Command {
  command: string;
  timestamp: string;
}

import { promises as fs } from "fs";
import path from "path";

interface UserInfo {
  id: string;
  name: string;
  role: string;
  last_access: string;
  fingerprint_status: string;
  positionFingerprint?: number;
}

interface PersistentData {
  currentUser: UserInfo | null;
  allUsers: UserInfo[];
  items: Item[];
  activityLogs: ActivityLog[];
  newEnrollPosition: number | null;
}

const DATA_FILE_PATH = path.join(process.cwd(), "data.json");

let currentState: State | null = null;
let commands: Command[] = [];
let logs: string[] = [];
let currentUser: UserInfo | null = null;

// File I/O functions for persistent data
export const readPersistentData = async (): Promise<PersistentData> => {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // Return default structure if file doesn't exist or is corrupted
    return {
      currentUser: null,
      allUsers: [],
      items: [],
      activityLogs: [],
      newEnrollPosition: null,
    };
  }
};

export const writePersistentData = async (
  data: PersistentData
): Promise<void> => {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing persistent data:", error);
  }
};

export const setState = async (newState: State) => {
  console.log("[STATE] setState called with:", newState);
  currentState = newState;
  logs.push(`[SYSTEM] Received state update: ${JSON.stringify(newState)}`);

  // Handle fingerprint authentication
  if (newState.event === "finger") {
    if (newState.code !== 0) {
      console.log("[STATE] no user found");
      logs.push(`[SYSTEM] no user found`);
      return;
    }
    const position = +newState.data;
    console.log(
      "[STATE] Processing fingerprint authentication for position:",
      position
    );
    logs.push(
      `[SYSTEM] Processing fingerprint authentication for position: ${position}`
    );
    const persistentData = await readPersistentData();
    console.log(
      "[STATE] Loaded users for authentication, count:",
      persistentData.allUsers.length
    );
    const user = persistentData.allUsers.find(
      (u) => u.positionFingerprint === position
    );

    if (user) {
      console.log("[STATE] Found user for position:", user.name);
      // Update last access and set as current user
      user.last_access = new Date().toISOString();
      currentUser = user;
      persistentData.currentUser = user;
      await writePersistentData(persistentData);
      logs.push(
        `[${user.name}] User authenticated via fingerprint at position ${position}`
      );
      console.log("[STATE] User authentication completed:", user.name);
    } else {
      console.log("[STATE] ERROR: No user found for position:", position);
      logs.push(
        `[ERROR] Unknown fingerprint position: ${position}. No user found with this position.`
      );
    }
  }
  // Handle fingerprint registration completion
  else if (newState.event === "register finger" && newState.code === 0) {
    console.log(
      "[STATE] Fingerprint registration completed at position:",
      newState.positionNumber
    );
    const persistentData = await readPersistentData();
    // Store the position for pending enrollment
    persistentData.newEnrollPosition = newState.positionNumber
      ? newState.positionNumber
      : 0;
    await writePersistentData(persistentData);
    logs.push(
      `[SYSTEM] Fingerprint registration completed at position: ${newState.positionNumber}. Ready for user enrollment.`
    );
  }
  // Handle enrollment command
  else if (newState.event === "enroll_fingerprint") {
    console.log("[STATE] Enrollment command received");
    logs.push(
      `[SYSTEM] Enrollment command received. Waiting for fingerprint registration.`
    );
  } else if (newState.event == "qr") {
  } else {
    console.log("[STATE] Other state update:", newState.event, newState.code);
    const userName = currentUser ? `[${currentUser.name}] ` : "[SYSTEM] ";
    logs.push(`${userName}State updated: ${JSON.stringify(newState)}`);
  }
  console.log("[STATE] setState completed");
};

export const getState = (): State | null => currentState;

export const setCommand = (command: string) => {
  const newCommand: Command = { command, timestamp: new Date().toISOString() };
  commands.push(newCommand);
  const userName = currentUser ? `[${currentUser.name}] ` : "";
  logs.push(`${userName}Command set: ${command}`);

  //clear command after 5s
  setTimeout(() => {
    commands = [];
  }, 5000);
};

export const getLatestCommand = (): Command | null => {
  return commands.length > 0 ? commands[commands.length - 1] : null;
};

export const getLogs = (): string[] => logs;

export const resetAll = async () => {
  currentState = null;
  commands = [];
  logs = [];
  currentUser = null;

  // Reset persistent data
  const persistentData: PersistentData = {
    currentUser: null,
    allUsers: [],
    items: [],
    activityLogs: [],
    newEnrollPosition: null,
  };
  await writePersistentData(persistentData);
};

export const setCurrentUser = async (user: UserInfo) => {
  currentUser = user;
  const persistentData = await readPersistentData();
  persistentData.currentUser = user;
  await writePersistentData(persistentData);
  logs.push(`[${user.name}] User authenticated: ${user.name}`);
};

export const getCurrentUser = (): UserInfo | null => currentUser;

// Additional functions for user management
export const getAllUsers = async (): Promise<UserInfo[]> => {
  const persistentData = await readPersistentData();
  return persistentData.allUsers;
};

export const addUser = async (user: UserInfo): Promise<void> => {
  logs.push(
    `[SYSTEM] Adding new user: ${user.name} (${user.role}) with ID: ${user.id}`
  );
  const persistentData = await readPersistentData();
  persistentData.allUsers.push(user);
  await writePersistentData(persistentData);
  logs.push(`[SUCCESS] User ${user.name} added to persistent storage`);
};

export const logoutUser = async (): Promise<void> => {
  currentUser = null;
  const persistentData = await readPersistentData();
  persistentData.currentUser = null;
  await writePersistentData(persistentData);
  logs.push("User logged out");
};

export const getPendingEnrollmentPosition = async (): Promise<
  number | null
> => {
  const persistentData = await readPersistentData();
  return persistentData.newEnrollPosition;
};

export const clearPendingEnrollmentPosition = async (): Promise<void> => {
  const persistentData = await readPersistentData();
  persistentData.newEnrollPosition = null
  await writePersistentData(persistentData)
};
