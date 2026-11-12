export async function getFinancialAdvice(totalBudget, totalIncome, totalSpent) {
    const response = await fetch("/api/financial-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ totalBudget, totalIncome, totalSpent }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || `Failed to generate financial advice (${response.status})`);
    }

    return data.advice;
}

export default getFinancialAdvice;