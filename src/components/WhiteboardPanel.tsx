"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface WhiteboardPanelProps {
  content: string;
  onChange: (content: string) => void;
}

export function WhiteboardPanel({ content, onChange }: WhiteboardPanelProps) {
  return (
    <div className="flex flex-col h-full bg-gray-800">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-700 border-b border-gray-600">
        <h2 className="text-lg font-semibold text-white">Whiteboard / Notes</h2>
        <p className="text-xs text-gray-400">
          Use this space to draft your approach, pseudocode, or solution.
          Supports Markdown.
        </p>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Editor */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-3 py-2 bg-gray-750 text-xs text-gray-400 border-b border-gray-600">
            Edit
          </div>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="# Your Notes / Pseudocode / Solution

Use this space to:
- Break down the problem
- Write pseudocode
- Draft your solution
- Track your thought process"
            className="flex-1 w-full p-4 bg-gray-800 text-gray-100 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            spellCheck={false}
          />
        </div>

        {/* Preview */}
        <div className="flex-1 flex flex-col min-h-0 border-t md:border-t-0 md:border-l border-gray-600">
          <div className="px-3 py-2 bg-gray-750 text-xs text-gray-400 border-b border-gray-600">
            Preview
          </div>
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content || "*Preview will appear here...*"}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
