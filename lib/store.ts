interface State {
  [key: string]: any;
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

let currentState: State = {};
let enrollResults: EnrollResult[] = [];
let commands: Command[] = [];
let logs: string[] = [];

export const setState = (newState: State) => {
  currentState = { ...currentState, ...newState };
  logs.push(`State updated: ${JSON.stringify(newState)}`);
};

export const getState = (): State => currentState;

export const addEnrollResult = (result: EnrollResult) => {
  enrollResults.push(result);
  logs.push(`Enroll result added: ${result.result}`);
};

export const getEnrollResults = (): EnrollResult[] => enrollResults;

export const setCommand = (command: string) => {
  const newCommand: Command = { command, timestamp: new Date().toISOString() };
  commands.push(newCommand);
  logs.push(`Command set: ${command}`);
};

export const getLatestCommand = (): Command | null => {
  return commands.length > 0 ? commands[commands.length - 1] : null;
};

export const getLogs = (): string[] => logs;

export const resetAll = () => {
  currentState = {};
  enrollResults = [];
  commands = [];
  logs = [];
};
