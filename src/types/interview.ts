export type InterviewPhase = 
  | "INITIALIZING"
  | "INTRO"
  | "PROBLEM_SOLVING"
  | "EVALUATION";

export type TargetRole = 
  | "Frontend"
  | "Backend"
  | "Fullstack"
  | "Systems"
  | "Mobile"
  | "DevOps"
  | "";

export type Seniority = 
  | "Junior"
  | "Mid-level"
  | "Senior"
  | "Staff"
  | "";

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
}

export interface InterviewState {
  phase: InterviewPhase;
  role: TargetRole;
  seniority: Seniority;
  messages: Message[];
  whiteboardContent: string;
  isLoading: boolean;
}

export const INITIAL_STATE: InterviewState = {
  phase: "INITIALIZING",
  role: "",
  seniority: "",
  messages: [],
  whiteboardContent: "",
  isLoading: false,
};
