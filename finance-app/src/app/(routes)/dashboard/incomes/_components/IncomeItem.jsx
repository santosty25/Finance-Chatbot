import React from "react";
import DeleteIncome from "./DeleteIncome";

function IncomeItem({ budget, refreshData, totalIncome = 0 }) {
  // Share of total income, as a number from 0 to 100
  const calculateProgressPerc = () => {
    if (!totalIncome) return 0;
    const perc = (Number(budget.amount) / totalIncome) * 100;
    return Math.min(perc, 100);
  };

  const perc = calculateProgressPerc();

  return (
    <div className="p-5 border rounded-2xl hover:shadow-md cursor-pointer min-h-[170px]">
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2 items-center">
          <h2 className="text-2xl p-3 px-4 bg-slate-100 rounded-full">
            {budget?.icon}
          </h2>
          <div>
            <h2 className="font-bold">{budget.name}</h2>
            <h2 className="text-sm text-gray-500">
              {perc.toFixed(0)}% of total income
            </h2>
          </div>
        </div>
        <h2 className="font-bold text-primary text-lg">${budget.amount}</h2>
      </div>

      {/* Progress bar */}
      <div className="mt-5">
        <div className="w-full bg-slate-300 h-2 rounded-full">
          <div
            className="bg-primary h-2 rounded-full"
            style={{ width: `${perc}%` }}
          ></div>
        </div>
      </div>

      <div className="mt-4">
        <DeleteIncome incomeId={budget.id} onDeleted={refreshData} />
      </div>
    </div>
  );
}

export default IncomeItem;