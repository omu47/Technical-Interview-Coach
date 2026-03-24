"use client";

import { useEffect, useCallback } from "react";
import { ChatPanel } from "@/components/ChatPanel";
import { WhiteboardPanel } from "@/components/WhiteboardPanel";
import { useInterviewState } from "@/hooks/useInterviewState";
import { Message } from "@/types/interview";

export default function Home() {
  const {
    state,
    setPhase,
    setRole,
    setSeniority,
    addMessage,
    updateLastMessage,
    setWhiteboardContent,
    setLoading,
    reset,
  } = useInterviewState();

  const handleInitialMessage = useCallback(async () => {
    setLoading(true);
    
    // Create a placeholder for the model's response
    const modelMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "model",
      content: "",
      timestamp: Date.now(),
    };
    addMessage(modelMessage);

    try {
      const messages = [{ role: "user", content: "Start the interview" }];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          phase: state.phase,
          role: state.role,
          seniority: state.seniority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n").filter(line => line.trim());

          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  fullContent += data.content;
                  updateLastMessage(fullContent);
                }
              } catch {
                // Ignore JSON parse errors for streaming chunks
              }
            }
          }

          // Update phase based on content
          if (fullContent.includes("problem") || fullContent.includes("coding")) {
            if (state.phase === "INTRO") {
              setPhase("PROBLEM_SOLVING");
            }
          }
        }
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to get response";
      updateLastMessage(`\n\n[Error: ${errorMsg}]`);
    } finally {
      setLoading(false);
    }
  }, [state.phase, state.role, state.seniority, addMessage, updateLastMessage, setPhase, setLoading]);

  // Start the interview on mount
  useEffect(() => {
    if (state.messages.length === 0) {
      handleInitialMessage();
    }
  }, [state.messages.length, handleInitialMessage]);

  const extractRoleAndSeniority = (content: string) => {
    const lower = content.toLowerCase();
    
    // Extract role
    if (lower.includes("frontend")) setRole("Frontend");
    else if (lower.includes("backend")) setRole("Backend");
    else if (lower.includes("fullstack")) setRole("Fullstack");
    else if (lower.includes("systems")) setRole("Systems");
    else if (lower.includes("mobile")) setRole("Mobile");
    else if (lower.includes("devops")) setRole("DevOps");

    // Extract seniority
    if (lower.includes("junior")) setSeniority("Junior");
    else if (lower.includes("mid") || lower.includes("mid-level")) setSeniority("Mid-level");
    else if (lower.includes("senior")) setSeniority("Senior");
    else if (lower.includes("staff")) setSeniority("Staff");
  };

  const handleSendMessage = async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: Date.now(),
    };
    addMessage(userMessage);

    // Extract role/seniority during INTRO phase
    if (state.phase === "INITIALIZING") {
      extractRoleAndSeniority(content);
      setPhase("INTRO");
    }

    // Send to API
    await sendToAPI(content, false);
  };

  const sendToAPI = async (userContent: string, isInitial: boolean) => {
    setLoading(true);

    // Create a placeholder for the model's response
    const modelMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "model",
      content: "",
      timestamp: Date.now(),
    };
    addMessage(modelMessage);

    try {
      const messages = isInitial
        ? [{ role: "user", content: "Start the interview" }]
        : [...state.messages, { role: "user", content: userContent }];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          phase: state.phase,
          role: state.role,
          seniority: state.seniority,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          fullContent += chunk;
          updateLastMessage(chunk);
        }
      }

      // Update phase based on content
      if (fullContent.includes("problem") || fullContent.includes("coding")) {
        if (state.phase === "INTRO") {
          setPhase("PROBLEM_SOLVING");
        }
      }
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMsg = error instanceof Error ? error.message : "Failed to get response";
      updateLastMessage(`\n\n[Error: ${errorMsg}]`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishInterview = async () => {
    setPhase("EVALUATION");
    setLoading(true);

    // Add a model message placeholder
    const modelMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "model",
      content: "",
      timestamp: Date.now(),
    };
    addMessage(modelMessage);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...state.messages,
            { role: "user", content: "Please provide a detailed feedback report on my interview performance." },
          ],
          phase: "EVALUATION",
          role: state.role,
          seniority: state.seniority,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get evaluation");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          updateLastMessage(chunk);
        }
      }
    } catch (error) {
      console.error("Error:", error);
      updateLastMessage("\n\n[Error: Failed to get evaluation. Please try again.]");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Start a new interview? This will clear all messages.")) {
      reset();
      // Re-trigger initial message after a brief delay
      setTimeout(() => handleInitialMessage(), 100);
    }
  };

  return (
    <main className="h-screen flex flex-col bg-gray-900">
      {/* Top Bar */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Technical Interview Coach</h1>
            <p className="text-sm text-gray-400">
              AI interviewer | Senior Staff Engineer persona
              {state.role && ` | ${state.seniority} ${state.role}`}
            </p>
          </div>
          <button
            onClick={handleReset}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
          >
            New Interview
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Chat Panel */}
        <div className="flex-1 min-h-0">
          <ChatPanel
            messages={state.messages}
            onSendMessage={handleSendMessage}
            isLoading={state.isLoading}
            onFinishInterview={handleFinishInterview}
            phase={state.phase}
          />
        </div>

        {/* Whiteboard Panel */}
        <div className="flex-1 min-h-0 border-t md:border-t-0 md:border-l border-gray-700">
          <WhiteboardPanel
            content={state.whiteboardContent}
            onChange={setWhiteboardContent}
          />
        </div>
      </div>
    </main>
  );
}
