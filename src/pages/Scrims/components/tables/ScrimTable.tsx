"use client";

import type { ReactNode } from "react";
import { RankBadge } from "../RankBadge";
import { getRankStyle } from "../../utils/formatters";

interface Column<T> {
  key: string;
  header: ReactNode;
  cell: (row: T, index: number) => ReactNode;
  className?: string;
}

interface ScrimTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyState: ReactNode;
  showRank?: boolean;
}

export function ScrimTable<T>({
  data,
  columns,
  keyExtractor,
  emptyState,
  showRank = true,
}: ScrimTableProps<T>) {
  if (!data || data.length === 0) {
    return <>{emptyState}</>;
  }

  return (
    <div className="bg-[#12121a] rounded-xl border border-[#2a2a3a] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a3a] bg-[#0a0a0f]">
              {showRank && (
                <th className="px-4 py-3 text-center text-xs font-medium text-[#5a5a6e] uppercase w-14">
                  Rank
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-medium text-[#5a5a6e] uppercase ${
                    col.className || ""
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2a2a3a]">
            {data.map((row, i) => (
              <tr
                key={keyExtractor(row, i)}
                className={`hover:bg-[#1a1a24] transition-colors ${getRankStyle(i)}`}
              >
                {showRank && (
                  <td className="px-4 py-3">
                    <RankBadge index={i} />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 ${col.className || ""}`}
                  >
                    {col.cell(row, i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}