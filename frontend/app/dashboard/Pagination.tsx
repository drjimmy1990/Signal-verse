"use client";

import { useState } from "react";

interface PaginationProps {
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, pageSize, onPageChange }: PaginationProps) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(total / pageSize);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    onPageChange(p);
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-4">
      <button
        onClick={() => goToPage(page - 1)}
        disabled={page === 1}
        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-sm text-gray-700">
        Page {page} of {totalPages}
      </span>
      <button
        onClick={() => goToPage(page + 1)}
        disabled={page === totalPages}
        className="px-3 py-1 bg-gray-800 text-white rounded disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}
