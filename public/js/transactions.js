

async function getTransactionsInRange(startDate, endDate, AUTH_TOKEN) {
    const response = await fetch('/api/transactions/inRange', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${AUTH_TOKEN}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ startDate, endDate })
    });

    if (!response.ok) {
        throw new Error('Failed to fetch transactions in range');
    }

    return await response.json();
}

// Fetch and display statistics
async function fetchStatistics() {
    try {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        // Fetch total income
        const incomeResponse = await fetch(`${API_URL_STATISTICS}/income`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "startDate": lastMonth,
                "endDate": new Date(),
            })
        });

        if (!incomeResponse.ok) {
            throw new Error('Failed to fetch income statistics');
        }

        const incomeStats = await incomeResponse.json();

        // Fetch total expenses
        const expensesResponse = await fetch(`${API_URL_STATISTICS}/expenses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                "startDate": lastMonth,
                "endDate": new Date(),
            })
        });

        if (!expensesResponse.ok) {
            throw new Error('Failed to fetch expense statistics');
        }

        const expenseStats = await expensesResponse.json();

        // Calculate total income and total expenses
        const totalIncome = incomeStats.reduce((acc, curr) => acc + curr.totalAmount, 0);
        const totalExpenses = expenseStats.reduce((acc, curr) => acc + curr.totalAmount, 0);

        // Create categoryIncome and categoryExpenses objects directly from the fetched data
        const categoryIncome = {};
        incomeStats.forEach(item => {
            categoryIncome[item.category] = item.totalAmount; // Directly use totalAmount
        });

        const categoryExpenses = {};
        expenseStats.forEach(item => {
            categoryExpenses[item.category] = item.totalAmount; // Directly use totalAmount
        });

        // Combine all statistics into a single object
        const stats = {
            totalIncome,
            totalExpenses,
            categoryIncome,
            categoryExpenses
        };

        return stats;
    } catch (error) {
        console.error('Error fetching statistics:', error);
    }
}

// Render statistics
function renderStatistics(stats, budgets) {

    statisticsDiv.innerHTML = `
        <p>Total Income: ₸${stats.totalIncome.toFixed(2)}</p>
        <p>Total Expenses: ₸${stats.totalExpenses.toFixed(2)}</p>
        <h5>Category Expenses:</h5>
        <ul>
            ${Object.entries(stats.categoryExpenses).map(([category, amount]) => {
                const budget = budgets.find(b => b.category === category);
                let color = '#000'; // Default color

                if (budget) {
                    if (amount >= budget.limit) {
                        color = '#ff6384'; // Red for exceeding budget
                    } else if (amount >= budget.limit / 2) {
                        color = 'orange'; // Yellow for half of the limit
                    }
                }

                return `<li style="color: ${color};">${category}: ₸${amount.toFixed(2)}</li>`;
            }).join('')}
        </ul>
        <h5>Category Income:</h5>
        <ul>
            ${Object.entries(stats.categoryIncome).map(([category, amount]) => `
                <li>${category}: ₸${amount.toFixed(2)}</li>
            `).join('')}
        </ul>
    `;
}