import { useState } from "react";
import { Brain, Send, Sparkles } from "lucide-react";
import aiService from "../services/aiService";

const AskSpendora = () => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAsk = async (e) => {
    e.preventDefault();

    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");

      const data = await aiService.askSpendora(question);

      setAnswer(data.answer);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to get an answer from Spendora.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Brain className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Ask Spendora
              </h1>

              <p className="text-sm text-slate-500">
                Your personal AI spending assistant
              </p>
            </div>
          </div>

          <p className="max-w-2xl text-slate-600">
            Ask questions about your expenses, spending habits, categories, and
            monthly spending.
          </p>
        </div>

        {/* Ask Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-600" />

            <h2 className="font-semibold text-slate-900">
              What would you like to know?
            </h2>
          </div>

          <form onSubmit={handleAsk}>
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="How much did I spend on groceries this month?"
                disabled={loading}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              />

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send className="h-4 w-4" />

                {loading ? "Thinking..." : "Ask"}
              </button>
            </div>
          </form>
          <div className="mt-5">
            <p className="mb-3 text-sm font-medium text-slate-600">
              Try asking
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                "How much did I spend this month?",
                "Where did I spend the most?",
                "How much did I spend on groceries?",
                "Compare my spending with last month.",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuestion(suggestion);
                    setError("");
                  }}
                  disabled={loading}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* Answer */}
        {answer && (
          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <Brain className="h-5 w-5" />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Spendora's Answer
                </h2>

                <p className="text-xs text-slate-500">
                  Based on your expense data
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <p className="whitespace-pre-line leading-7 text-slate-700">
                {answer.replace(/\\\*\\\*/g, "").replace(/\*\*/g, "")}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AskSpendora;
