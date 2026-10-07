import { useEffect, useState } from "react";
import {
  Brain,
  TrendingUp,
  Lightbulb,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

import aiService from "../services/aiService";

const Insights = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadInsights = async () => {
    try {
      setLoading(true);
      setError("");

      const result = await aiService.getSpendingInsights();

      setData(result);
    } catch (error) {
      console.error("Failed to load AI insights:", error);

      setError(
        error.response?.data?.message ||
          "Failed to generate spending insights.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadInsights();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center">
            <RefreshCw className="w-8 h-8 mx-auto text-blue-600 animate-spin" />

            <p className="mt-4 text-slate-600">Analyzing your spending...</p>

            <p className="mt-1 text-sm text-slate-400">
              Spendora AI is preparing your insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 text-red-600">
              <AlertCircle className="w-6 h-6" />

              <h2 className="text-lg font-semibold">
                Unable to generate insights
              </h2>
            </div>

            <p className="mt-3 text-slate-600">{error}</p>

            <button
              onClick={loadInsights}
              className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const spendingData = data?.spendingData;
  const aiInsights = data?.aiInsights;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Brain className="w-7 h-7 text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                AI Spending Insights
              </h1>

              <p className="text-slate-500 mt-1">
                Understand your spending with personalized AI-powered analysis.
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <Lightbulb className="w-6 h-6 text-blue-600" />
            </div>

            <div>
              <p className="text-sm font-medium text-slate-500">AI Summary</p>

              <p className="mt-2 text-lg font-semibold text-slate-900">
                {aiInsights?.summary || "No summary available."}
              </p>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          {aiInsights?.insights?.map((insight, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-slate-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-slate-700" />
                </div>

                <span className="text-sm font-medium text-slate-500">
                  Insight {index + 1}
                </span>
              </div>

              <p className="text-slate-800 leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>

        {/* Spending Comparison */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Spending Comparison
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Current month vs previous month
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Current Month */}
            <div className="border border-slate-200 rounded-xl p-5">
              <p className="text-sm text-slate-500">Current Month</p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(spendingData?.currentMonth?.total)}
              </p>
            </div>

            {/* Previous Month */}
            <div className="border border-slate-200 rounded-xl p-5">
              <p className="text-sm text-slate-500">Previous Month</p>

              <p className="text-2xl font-bold text-slate-900 mt-2">
                {formatCurrency(spendingData?.previousMonth?.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Refresh */}
        <div className="flex justify-end mt-6">
          <button
            onClick={loadInsights}
            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 bg-white text-slate-700 rounded-lg hover:bg-slate-50 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Insights
          </button>
        </div>
      </div>
    </div>
  );
};

export default Insights;
