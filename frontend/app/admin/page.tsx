"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface ScannerConfig {
  id: string;
  scanner_id: string;
  name: string;
  description: string;
  is_active: boolean;
  last_run_timestamp: string | null;
  last_run_status: string | null;
  last_error_message: string | null;
}

export default function AdminPage() {
  const [scanners, setScanners] = useState<ScannerConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanners = async () => {
      const { data, error } = await supabase
        .from("scanner_configs")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching scanners:", error);
      } else {
        setScanners(data || []);
      }
      setLoading(false);
    };

    fetchScanners();
  }, []);

  if (loading) return <p className="p-4">Loading admin data...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ Admin Panel</h1>
      <table className="min-w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Name</th>
            <th className="p-2 border">Active</th>
            <th className="p-2 border">Last Run</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Error</th>
          </tr>
        </thead>
        <tbody>
          {scanners.map((s) => (
            <tr key={s.id}>
              <td className="p-2 border">{s.name}</td>
              <td className="p-2 border">{s.is_active ? "✅" : "❌"}</td>
              <td className="p-2 border">
                {s.last_run_timestamp
                  ? new Date(s.last_run_timestamp).toLocaleString()
                  : "-"}
              </td>
              <td className="p-2 border">{s.last_run_status || "-"}</td>
              <td className="p-2 border text-red-600">
                {s.last_error_message || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
