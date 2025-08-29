"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import Filters from "./Filters";
import Pagination from "./Pagination";

interface Signal {
  id: string;
  scanner_type: string;
  symbol: string;
  timeframe: string;
  signal_codes: string[];
  signal_id: string;
  candle_timestamp: string;
  entry_price: number;
  status: string;
  metadata: any;
}

export default function DashboardPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>({});
  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchSignals = async () => {
      let query = supabase
        .from("signals")
        .select("*", { count: "exact" })
        .order("candle_timestamp", { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (filters.symbol) query = query.eq("symbol", filters.symbol);
      if (filters.timeframe) query = query.eq("timeframe", filters.timeframe);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.signalCodes?.length)
        query = query.contains("signal_codes", filters.signalCodes);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching signals:", error);
      } else {
        setSignals(data || []);
        setTotal(
          data && data.length > 0 ? (data[0].total_count || 0) : 0
        );
      }
      setLoading(false);
    };

    fetchSignals();

    // Realtime subscription
    const channel = supabase
      .channel("signals-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "signals" },
        (payload: { new: Signal }) => {
          setSignals((prev) => [payload.new as Signal, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [filters, page]);

  if (loading) return <p className="p-4">Loading signals...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Signal Dashboard</h1>

      {/* Filters */}
      <div className="mb-6">
        <Filters onChange={setFilters} />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200 bg-white dark:bg-gray-900">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Symbol
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Timeframe
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Codes
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Entry Price
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Timestamp
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {signals.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <td className="px-4 py-2 font-medium text-gray-900 dark:text-gray-100">
                  {s.symbol}
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {s.timeframe}
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300 space-x-1">
                  {s.signal_codes.map((code) => (
                    <span
                      key={code}
                      className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
                    >
                      {code}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {s.entry_price}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      s.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : s.status === "confirmed"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {s.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-gray-700 dark:text-gray-300">
                  {new Date(s.candle_timestamp).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination total={total} pageSize={pageSize} onPageChange={setPage} />
    </div>
  );
}
