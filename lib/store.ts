interface State {
  event: string;
  code: number;
  data: string;
  time: string;
}

interface EnrollResult {
  id: string;
  result: string;
  timestamp: string;
}

interface Command {
  command: string;
  timestamp: string;
}

interface ImageData {
  url: string;
  timestamp: string;
  metadata: {
    detected_tools: string[];
    confidence_scores: number[];
    annotations: any[];
  };
}

import { promises as fs } from "fs";
import path from "path";

interface UserInfo {
  id: string;
  name: string;
  role: string;
  last_access: string;
  fingerprint_status: string;
  positionFingerprint?: string;
}

interface PersistentData {
  currentUser: UserInfo | null;
  allUsers: UserInfo[];
}

const DATA_FILE_PATH = path.join(process.cwd(), "data.json");

let currentState: State | null = null;
let enrollResults: EnrollResult[] = [];
let commands: Command[] = [];
let logs: string[] = [];
let latestImage: ImageData | null = null;
let currentUser: UserInfo | null = null;
let pendingEnrollmentPosition: string | null = null;

// File I/O functions for persistent data
const readPersistentData = async (): Promise<PersistentData> => {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // Return default structure if file doesn't exist or is corrupted
    return { currentUser: null, allUsers: [] };
  }
};

const writePersistentData = async (data: PersistentData): Promise<void> => {
  try {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error writing persistent data:", error);
  }
};

export const setState = async (newState: State) => {
  currentState = newState;

  // Handle fingerprint authentication
  if (newState.event === "finger" && newState.code === 0) {
    const position = newState.data;
    const persistentData = await readPersistentData();
    const user = persistentData.allUsers.find(
      (u) => u.positionFingerprint === position
    );

    if (user) {
      // Update last access and set as current user
      user.last_access = new Date().toISOString();
      currentUser = user;
      persistentData.currentUser = user;
      await writePersistentData(persistentData);
      logs.push(`[${user.name}] User authenticated via fingerprint`);
    } else {
      logs.push(`Unknown fingerprint position: ${position}`);
    }
  }
  // Handle fingerprint registration completion
  else if (newState.event === "register finger" && newState.code === 0) {
    // Store the position for pending enrollment
    pendingEnrollmentPosition = newState.data;
    logs.push(`Fingerprint registration completed at position: ${newState.data}`);
  } else {
    const userName = currentUser ? `[${currentUser.name}] ` : "";
    logs.push(`${userName}State updated: ${JSON.stringify(newState)}`);
  }
};

export const getState = (): State | null => currentState;

export const addEnrollResult = async (result: EnrollResult) => {
  enrollResults.push(result);

  // If enrollment was successful, save the position fingerprint
  if (result.result === "success" && result.id) {
    const persistentData = await readPersistentData();
    const user = persistentData.allUsers.find((u) => u.id === result.id);
    if (user && !user.positionFingerprint) {
      // This assumes the position comes from the latest state or is embedded in result
      // For now, we'll need to get it from the current state if it's a finger event
      if (currentState && currentState.event === "finger") {
        user.positionFingerprint = currentState.data;
        user.fingerprint_status = "enrolled";
        await writePersistentData(persistentData);
      }
    }
  }

  const userName = currentUser ? `[${currentUser.name}] ` : "";
  logs.push(`${userName}Enroll result added: ${result.result}`);
};

export const getEnrollResults = (): EnrollResult[] => enrollResults;

export const setCommand = (command: string) => {
  const newCommand: Command = { command, timestamp: new Date().toISOString() };
  commands.push(newCommand);
  const userName = currentUser ? `[${currentUser.name}] ` : "";
  logs.push(`${userName}Command set: ${command}`);
};

export const getLatestCommand = (): Command | null => {
  return commands.length > 0 ? commands[commands.length - 1] : null;
};

export const getLogs = (): string[] => logs;

export const resetAll = async () => {
  currentState = null;
  enrollResults = [];
  commands = [];
  logs = [];
  latestImage = null;
  currentUser = null;
  pendingEnrollmentPosition = null;

  // Reset persistent data
  const persistentData: PersistentData = { currentUser: null, allUsers: [] };
  await writePersistentData(persistentData);
};

export const setLatestImage = (image: ImageData) => {
  latestImage = image;
  const userName = currentUser ? `[${currentUser.name}] ` : "";
  logs.push(`${userName}New image received: ${image.timestamp}`);
};

export const getLatestImage = (): ImageData | null => latestImage;

// TODO: add new user to json
export const addNewUser = async (user: UserInfo) => {
  const persistentData = await readPersistentData();
  persistentData.allUsers.push(user);
  await writePersistentData(persistentData);
  logs.push(`Account added : ${user.name}`);
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
  const persistentData = await readPersistentData();
  persistentData.allUsers.push(user);
  await writePersistentData(persistentData);
};

export const logoutUser = async (): Promise<void> => {
  currentUser = null;
  const persistentData = await readPersistentData();
  persistentData.currentUser = null;
  await writePersistentData(persistentData);
  logs.push("User logged out");
};

export const getPendingEnrollmentPosition = (): string | null => pendingEnrollmentPosition;

export const clearPendingEnrollmentPosition = (): void => {
  pendingEnrollmentPosition = null;
};
