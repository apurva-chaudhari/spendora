import { useEffect, useRef, useState } from "react";
import { Brain, RotateCcw, Send, Sparkles } from "lucide-react";

import AppLayout from "../components/AppLayout";
import { Button } from "../components/ui";
import aiService from "../services/aiService";
import { getStoredUser } from "../lib/format";

const SUGGESTIONS = [
  "How much did I spend this month?",
  "Where did I spend the most?",
  "How much did I spend on food?",
  "Compare my spending with last month.",
];

// Render **bold** segments without pulling in a markdown library.
const RichText = ({ text }) => (
  <>
    {String(text)
      .split(/(\*\*[^*]+\*\*)/g)
      .map((part, i) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
  </>
);

const AssistantAvatar = () => (
  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white">
    <Brain size={16} />
  </div>
);

const AskSpendora = () => {
  const user = getStoredUser();
  const firstName = user?.name?.split(" ")[0];

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  const send = async (text) => {
    const content = text.trim();
    if (!content || loading) return;

    setMessages((current) => [...current, { role: "user", content }]);
    setQuestion("");
    setLoading(true);

    try {
      const data = await aiService.askSpendora(content);
      setMessages((current) => [
        ...current,
        { role: "assistant", content: data.answer || "I couldn't find an answer to that." },
      ]);
    } catch (err) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          error: true,
          retry: content,
          content:
            err.response?.data?.message ||
            "Something went wrong while getting your answer.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    send(question);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(question);
    }
  };

  return (
    <AppLayout
      title="Ask Spendora"
      subtitle="Ask anything about your expenses in plain English."
      maxWidth="max-w-4xl"
      actions={
        messages.length > 0 && (
          <Button variant="secondary" onClick={() => setMessages([])} disabled={loading}>
            <RotateCcw size={15} />
            New chat
          </Button>
        )
      }
    >
      <div className="flex h-[calc(100dvh-15rem)] min-h-[460px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:h-[calc(100dvh-17rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
                <Sparkles size={26} />
              </div>
              <h2 className="text-lg font-semibold text-slate-900">
                Hi{firstName ? `, ${firstName}` : ""}! What would you like to know?
              </h2>
              <p className="mt-1.5 max-w-sm text-sm text-slate-500">
                I can answer questions using your recorded expenses. Try one of these:
              </p>
              <div className="mt-6 grid w-full max-w-xl gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => send(suggestion)}
                    className="rounded-xl border border-slate-200 px-4 py-3 text-left text-sm text-slate-700 transition hover:border-brand-300 hover:bg-brand-50"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {messages.map((message, index) =>
                message.role === "user" ? (
                  <div key={index} className="flex justify-end">
                    <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-brand-600 px-4 py-2.5 text-sm leading-relaxed text-white sm:max-w-[75%]">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <div key={index} className="flex items-start gap-3">
                    <AssistantAvatar />
                    <div
                      className={`max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-md px-4 py-2.5 text-sm leading-relaxed sm:max-w-[75%] ${
                        message.error
                          ? "border border-red-200 bg-red-50 text-red-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      <RichText text={message.content} />
                      {message.error && message.retry && (
                        <button
                          onClick={() => send(message.retry)}
                          disabled={loading}
                          className="mt-2 block text-xs font-medium underline disabled:opacity-50"
                        >
                          Try again
                        </button>
                      )}
                    </div>
                  </div>
                ),
              )}

              {loading && (
                <div className="flex items-start gap-3">
                  <AssistantAvatar />
                  <div
                    className="flex items-center gap-1.5 rounded-2xl rounded-tl-md bg-slate-100 px-4 py-3.5"
                    role="status"
                    aria-label="Spendora is thinking"
                  >
                    {[0, 150, 300].map((delay) => (
                      <span
                        key={delay}
                        className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                        style={{ animationDelay: `${delay}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions after first message */}
        {messages.length > 0 && !loading && (
          <div className="flex gap-2 overflow-x-auto border-t border-slate-100 px-4 py-2.5 sm:px-6">
            {SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => send(suggestion)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form onSubmit={handleSubmit} className="border-t border-slate-200 p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              rows={1}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your spending..."
              aria-label="Your question"
              maxLength={500}
              className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
            />
            <Button
              type="submit"
              disabled={!question.trim() || loading}
              aria-label="Send question"
              className="h-11 w-11 shrink-0 !rounded-xl !p-0"
            >
              <Send size={17} />
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default AskSpendora;
