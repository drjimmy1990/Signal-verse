"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

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
  const [symbolFilter, setSymbolFilter] = useState("");
  const [timeframeFilter, setTimeframeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [codeFilter, setCodeFilter] = useState("");

  useEffect(() => {
    const fetchSignals = async () => {
      let query = supabase.from("signals").select("*").order("candle_timestamp", { ascending: false }).limit(100);

      if (symbolFilter) query = query.eq("symbol", symbolFilter);
      if (timeframeFilter) query = query.eq("timeframe", timeframeFilter);
      if (statusFilter) query = query.eq("status", statusFilter);
      if (codeFilter) query = query.contains("signal_codes", [codeFilter]);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching signals:", error);
      } else {
        setSignals(data || []);
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
  }, [symbolFilter, timeframeFilter, statusFilter, codeFilter]);

  if (loading) return <p className="p-4">Loading signals...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">📊 Signal Dashboard</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          placeholder="Filter by Symbol (e.g. BTCUSDT)"
          value={symbolFilter}
          onChange={(e) => setSymbolFilter(e.target.value.toUpperCase())}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by Timeframe (e.g. 1h)"
          value={timeframeFilter}
          onChange={(e) => setTimeframeFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="text"
          placeholder="Filter by Signal Code"
          value={codeFilter}
          onChange={(e) => setCodeFilter(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* Table */}
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Symbol</th>
            <th className="p-2 border">Timeframe</th>
            <th className="p-2 border">Codes</th>
            <th className="p-2 border">Entry Price</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Timestamp</th>
          </tr>
        </thead>
        <tbody>
          {signals.map((s) => (
            <tr key={s.id}>
              <td className="p-2 border">{s.symbol}</td>
              <td className="p-2 border">{s.timeframe}</td>
              <td className="p-2 border">{s.signal_codes.join(", ")}</td>
              <td className="p-2 border">{s.entry_price}</td>
              <td className="p-2 border">{s.status}</td>
              <td className="p-2 border">
                {new Date(s.candle_timestamp).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
