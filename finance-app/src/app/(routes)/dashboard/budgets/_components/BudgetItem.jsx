import Link from "next/link";
import React from "react";
import DeleteBudget from "./DeleteBudget";

function BudgetItem({ budget, refreshData = undefined }) {
  const calculateProgressPerc = () => {
    const perc = (budget.totalSpend / budget.amount) * 100;
    return perc > 100 ? 100 : perc.toFixed(2);
  };

  return (
    <div className="border rounded-2xl hover:shadow-md min-h-[170px]">
      <Link href={"/dashboard/expenses/" + budget?.id} className="block p-5">
        <div className="flex gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <h2 className="text-2xl p-3 px-4 bg-slate-100 rounded-full">
              {budget?.icon}
            </h2>
            <div>
              <h2 className="font-bold">{budget.name}</h2>
              <h2 className="text-sm text-gray-500">{budget.totalItem} Item</h2>
            </div>
          </div>
          <h2 className="font-bold text-primary text-lg"> ${budget.amount}</h2>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs text-slate-400">
              ${budget.totalSpend ? budget.totalSpend : 0} Spend
            </h2>
            <h2 className="text-xs text-slate-400">
              ${budget.amount - budget.totalSpend} Remaining
            </h2>
          </div>
          <div className="w-full bg-slate-300 h-2 rounded-full">
            <div
              className="bg-primary h-2 rounded-full"
              style={{ width: `${calculateProgressPerc()}%` }}
            ></div>
          </div>
        </div>
      </Link>

      {refreshData && (
        <div className="px-5 pb-5">
          <DeleteBudget budgetId={budget.id} onDeleted={refreshData} />
        </div>
      )}
    </div>
  );
}

export default BudgetItem;