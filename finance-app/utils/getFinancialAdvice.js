export async function getFinancialAdvice(message) {
    const response = await fetch("/api/financial-advice", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
    });

    if (!response.ok) {
        throw new Error("Failed to generate financial advice");
    }

    const data = await response.json();

    return data.advice;
}

export default getFinancialAdvice;