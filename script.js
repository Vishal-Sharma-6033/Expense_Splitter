    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let expenseIdCounter = expenses.length > 0 ? expenses[expenses.length - 1].id + 1 : 1;

    // Set today's date as default
    document.getElementById('date').valueAsDate = new Date();

    // Form submission
    document.getElementById('expenseForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addExpense();
    });

    // Filter and sort listeners
    document.getElementById('filterCategory').addEventListener('change', renderExpenses);
    document.getElementById('sortBy').addEventListener('change', renderExpenses);

    function addExpense() {
        const description = document.getElementById('description').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const date = document.getElementById('date').value;
        const category = document.getElementById('category').value;
        const friend1 = document.getElementById('friend1').value;
        const friend2 = document.getElementById('friend2').value;
        const notes = document.getElementById('notes').value;

        if (!description || !amount || !date || !friend1 || !friend2) {
            showToast('Please fill in all required fields', 'error');
            return;
        }

        const expense = {
            id: expenseIdCounter++,
            description,
            amount,
            date,
            category,
            friends: ['You', friend1, friend2],
            splitAmount: amount / 3,
            notes,
            timestamp: new Date().toISOString()
        };

        expenses.push(expense);
        saveExpenses();
        renderExpenses();
        updateSummary();
        clearForm();
        showToast('Expense added successfully!', 'success');
    }

    function clearForm() {
        document.getElementById('expenseForm').reset();
        document.getElementById('date').valueAsDate = new Date();
    }

    function renderExpenses() {
        const filterCategory = document.getElementById('filterCategory').value;
        const sortBy = document.getElementById('sortBy').value;
        
        let filteredExpenses = [...expenses];

        // Apply category filter
        if (filterCategory) {
            filteredExpenses = filteredExpenses.filter(expense => expense.category === filterCategory);
        }

        // Apply sorting
        filteredExpenses.sort((a, b) => {
            switch (sortBy) {
                case 'date-desc':
                    return new Date(b.date) - new Date(a.date);
                case 'date-asc':
                    return new Date(a.date) - new Date(b.date);
                case 'amount-desc':
                    return b.amount - a.amount;
                case 'amount-asc':
                    return a.amount - b.amount;
                default:
                    return new Date(b.date) - new Date(a.date);
            }
        });

        const expensesList = document.getElementById('expensesList');
        
        if (filteredExpenses.length === 0) {
            expensesList.innerHTML = `
                <div class="empty-state">
                    <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"/>
                    </svg>
                    <h3>No expenses found</h3>
                    <p>Try adjusting your filters or add a new expense</p>
                </div>
            `;
            return;
        }

        expensesList.innerHTML = filteredExpenses.map(expense => `
            <div class="expense-item">
                <div class="expense-header">
                    <div>
                        <div class="expense-title">${expense.description}</div>
                        <div class="expense-details">
                            📅 ${formatDate(expense.date)} • 
                            📁 ${expense.category}
                            ${expense.notes ? ` • 📝 ${expense.notes}` : ''}
                        </div>
                    </div>
                    <div class="expense-amount">₹${expense.amount.toFixed(2)}</div>
                </div>
                
                <div class="split-details">
                    <h4 style="margin-bottom: 10px; color: #374151;">💸 Split Details:</h4>
                    ${expense.friends.map(friend => `
                        <div class="split-row">
                            <span>${friend}:</span>
                            <span>₹${expense.splitAmount.toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
                
                <button class="delete-btn" onclick="deleteExpense(${expense.id})">🗑️ Delete</button>
            </div>
        `).join('');
    }

    function updateSummary() {
        const total = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const yourShare = expenses.reduce((sum, expense) => sum + expense.splitAmount, 0);
        
        document.getElementById('totalAmount').textContent = `₹${total.toFixed(2)}`;
        document.getElementById('yourShare').textContent = `₹${yourShare.toFixed(2)}`;
    }

    function deleteExpense(id) {
        if (confirm('Are you sure you want to delete this expense?')) {
            expenses = expenses.filter(expense => expense.id !== id);
            saveExpenses();
            renderExpenses();
            updateSummary();
            showToast('Expense deleted successfully!', 'success');
        }
    }

    function clearAllExpenses() {
        if (expenses.length === 0) {
            showToast('No expenses to clear!', 'error');
            return;
        }
        
        if (confirm('Are you sure you want to delete ALL expenses? This action cannot be undone.')) {
            expenses = [];
            saveExpenses();
            renderExpenses();
            updateSummary();
            showToast('All expenses cleared!', 'success');
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    }

    function showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Save expenses to localStorage
    function saveExpenses() {
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    // Auto-save friend names
    let savedFriends = JSON.parse(localStorage.getItem("savedFriends")) || { friend1: '', friend2: '' };
    
    document.getElementById('friend1').addEventListener('blur', function() {
        savedFriends.friend1 = this.value;
        localStorage.setItem("savedFriends", JSON.stringify(savedFriends));
    });
    
    document.getElementById('friend2').addEventListener('blur', function() {
        savedFriends.friend2 = this.value;
        localStorage.setItem("savedFriends", JSON.stringify(savedFriends));
    });

    // Restore friend names when adding new expense
    document.getElementById('expenseForm').addEventListener('reset', function() {
        setTimeout(() => {
            if (savedFriends.friend1) document.getElementById('friend1').value = savedFriends.friend1;
            if (savedFriends.friend2) document.getElementById('friend2').value = savedFriends.friend2;
        }, 100);
    });

    // Initialize the app
    renderExpenses();
    updateSummary();
