"use client";

import { useReducer, useCallback } from "react";
import {
  InterviewState,
  InterviewPhase,
  TargetRole,
  Seniority,
  Message,
  INITIAL_STATE,
} from "@/types/interview";

type Action =
  | { type: "SET_PHASE"; payload: InterviewPhase }
  | { type: "SET_ROLE"; payload: TargetRole }
  | { type: "SET_SENIORITY"; payload: Seniority }
  | { type: "ADD_MESSAGE"; payload: Message }
  | { type: "UPDATE_LAST_MESSAGE"; payload: string }
  | { type: "SET_WHITEBOARD"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "RESET" };

function interviewReducer(state: InterviewState, action: Action): InterviewState {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "SET_ROLE":
      return { ...state, role: action.payload };
    case "SET_SENIORITY":
      return { ...state, seniority: action.payload };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.payload] };
    case "UPDATE_LAST_MESSAGE":
      const updatedMessages = [...state.messages];
      if (updatedMessages.length > 0) {
        const lastMsg = updatedMessages[updatedMessages.length - 1];
        if (lastMsg.role === "model") {
          lastMsg.content += action.payload;
        }
      }
      return { ...state, messages: updatedMessages };
    case "SET_WHITEBOARD":
      return { ...state, whiteboardContent: action.payload };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "RESET":
      return INITIAL_STATE;
    default:
      return state;
  }
}

export function useInterviewState() {
  const [state, dispatch] = useReducer(interviewReducer, INITIAL_STATE);

  const setPhase = useCallback((phase: InterviewPhase) => {
    dispatch({ type: "SET_PHASE", payload: phase });
  }, []);

  const setRole = useCallback((role: TargetRole) => {
    dispatch({ type: "SET_ROLE", payload: role });
  }, []);

  const setSeniority = useCallback((seniority: Seniority) => {
    dispatch({ type: "SET_SENIORITY", payload: seniority });
  }, []);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: "ADD_MESSAGE", payload: message });
  }, []);

  const updateLastMessage = useCallback((content: string) => {
    dispatch({ type: "UPDATE_LAST_MESSAGE", payload: content });
  }, []);

  const setWhiteboardContent = useCallback((content: string) => {
    dispatch({ type: "SET_WHITEBOARD", payload: content });
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    dispatch({ type: "SET_LOADING", payload: loading });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  return {
    state,
    setPhase,
    setRole,
    setSeniority,
    addMessage,
    updateLastMessage,
    setWhiteboardContent,
    setLoading,
    reset,
  };
}
