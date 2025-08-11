import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserDashboard.css';

const UserDashboard = () => {
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [balance, setBalance] = useState(0);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [newAccountAmount, setNewAccountAmount] = useState('');
    const [depositAmount, setDepositAmount] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');


    const [searchType, setSearchType] = useState('all');
    const [searchDate, setSearchDate] = useState('');
    const [filteredTransactions, setFilteredTransactions] = useState([]);

    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchAccounts();
    }, []);

  
    useEffect(() => {
        let filtered = [...transactions];

        if (searchType !== 'all') {
            filtered = filtered.filter(transaction => {
                const transactionType = transaction.type.toLowerCase();
                const searchTypeValue = searchType.toLowerCase();

                // Handle different possible withdrawal type names
                if (searchTypeValue === 'withdraw') {
                    return transactionType === 'withdraw' ||
                        transactionType === 'withdrawal' ||
                        transactionType === 'debit';
                } else if (searchTypeValue === 'deposit') {
                    return transactionType === 'deposit' ||
                        transactionType === 'credit';
                }

                return transactionType === searchTypeValue;
            });
        }

       
        if (searchDate) {
            const selectedDate = new Date(searchDate);
            selectedDate.setHours(0, 0, 0, 0);
            const nextDay = new Date(selectedDate);
            nextDay.setDate(nextDay.getDate() + 1);

            filtered = filtered.filter(transaction => {
                const transactionDate = new Date(transaction.timestamp);
                transactionDate.setHours(0, 0, 0, 0);
                return transactionDate.getTime() === selectedDate.getTime();
            });
        }

        setFilteredTransactions(filtered);
    }, [transactions, searchType, searchDate]);

    const fetchAccounts = async () => {
        try {
            const response = await axios.get('http://localhost:8080/api/user/accounts', {
                headers: { Authorization: `Bearer ${token}` },
            });

            console.log('Accounts:', response.data);
            setAccounts(response.data);

            if (response.data.length > 0) {
                const defaultAccount = response.data[0];
                setSelectedAccount(defaultAccount);
                fetchBalance(defaultAccount.id);
                fetchTransactions(defaultAccount.id);
            }
        } catch (err) {
            setError('Failed to fetch accounts');
        }
    };

    const fetchBalance = async (accountId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/user/accounts/${accountId}/balance`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBalance(response.data);
        } catch (err) {
            setError('Failed to fetch balance');
        }
    };

    const fetchTransactions = async (accountId) => {
        try {
            const response = await axios.get(`http://localhost:8080/api/user/accounts/${accountId}/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Transactions:', response.data); 
            setTransactions(response.data);
        } catch (err) {
            setError('Failed to fetch transactions');
        }
    };

    // const createAccount = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     try {
    //         await axios.post('http://localhost:8080/api/user/accounts', {
    //             amount: parseFloat(newAccountAmount),
    //         }, {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //         setNewAccountAmount('');
    //         fetchAccounts();
    //     } catch (err) {
    //         setError('Failed to create account');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    const createAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:8080/api/user/accounts', {
                initialAmount: parseFloat(newAccountAmount),
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setNewAccountAmount('');
            fetchAccounts();
        } catch (err) {
            setError('Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const makeDeposit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(
                `http://localhost:8080/api/user/accounts/${selectedAccount.id}/deposit`,
                { amount: parseFloat(depositAmount) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDepositAmount('');
            setWithdrawAmount('');
            fetchBalance(selectedAccount.id);
            fetchTransactions(selectedAccount.id);
            setError(null);
        } catch (err) {
            if (err.response && err.response.data) {
                const errorMessage = err.response.data.message || err.response.data.error || err.response.data;
                setError(errorMessage);
            } else {
                setError('Failed to make deposit');
            }
        } finally {
            setLoading(false);
        }
    };

    const makeWithdrawal = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(
                `http://localhost:8080/api/user/accounts/${selectedAccount.id}/withdraw`,
                { amount: parseFloat(withdrawAmount) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setWithdrawAmount('');
            setDepositAmount('');
            fetchBalance(selectedAccount.id);
            fetchTransactions(selectedAccount.id);
            setError(null);
        } catch (err) {
            if (err.response && err.response.data) {
                const errorMessage = err.response.data.message || err.response.data.error || err.response.data;

                if (typeof errorMessage === 'string' &&
                    (errorMessage.toLowerCase().includes('insufficient') ||
                        errorMessage.toLowerCase().includes('balance') ||
                        errorMessage.toLowerCase().includes('not enough') ||
                        err.response.status === 400)) {
                    setError('Insufficient balance for this withdrawal');
                } else {
                    setError(errorMessage);
                }
            } else {
                setError('Failed to make withdrawal');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAccountChange = (e) => {
        const accountId = parseInt(e.target.value);
        const account = accounts.find(acc => acc.id === accountId);
        setSelectedAccount(account);
        fetchBalance(accountId);
        fetchTransactions(accountId);
        // Reset search filters when changing accounts
        setSearchType('all');
        setSearchDate('');
    };

    const clearSearchFilters = () => {
        setSearchType('all');
        setSearchDate('');
    };

    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">User Dashboard</h1>
            {error && <p className="error-text">{error}</p>}

            {/* 1. ACCOUNTS SECTION */}
            <div className="accounts-section">
                <h2>Your Accounts</h2>
                <div className="accounts-container">
                    <select className="account-select" value={selectedAccount?.id || ''} onChange={handleAccountChange}>
                        <option value="">Select an account</option>
                        {accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                Account #{account.number || account.accountNumber || account.id}
                            </option>
                        ))}
                    </select>
                    {selectedAccount && (
                        <div className="balance-display">
                            <strong>Current Balance: ₹{Number(balance || 0).toFixed(2)}</strong>
                        </div>
                    )}
                </div>
            </div>

            {/* 2. ACCOUNT CREATION SECTION */}
            {/* <div className="create-account-section">
                <h2>Create New Account</h2>
                <form onSubmit={createAccount} className="create-account-form">
                    <input
                        type="number"
                        value={newAccountAmount}
                        onChange={(e) => setNewAccountAmount(e.target.value)}
                        placeholder="Initial deposit amount"
                        min="0"
                        step="0.01"
                        required
                    />
                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
            </div> */}

            {accounts.length === 0 && (
                <div className="create-account-section">
                    <h2>Create New Account</h2>
                    <form onSubmit={createAccount} className="create-account-form">
                        <input type="number" value={newAccountAmount} onChange={(e) => setNewAccountAmount(e.target.value)} placeholder="Initial deposit amount" min="0" step="0.01" required />
                        <button type="submit" disabled={loading}> {loading ? 'Creating...' : 'Create Account'} </button>
                    </form>
                </div>
            )}

            {/* 3. DEPOSIT AND WITHDRAWAL SECTION (SIDE BY SIDE) */}
            {selectedAccount && (
                <div className="transaction-operations">
                    <h2>Account Operations</h2>
                    <div className="transaction-forms">
                        <div className="form-box deposit-box">
                            <h3>Deposit Money</h3>
                            <form onSubmit={makeDeposit}>
                                <input
                                    type="number"
                                    value={depositAmount}
                                    onChange={(e) => setDepositAmount(e.target.value)}
                                    placeholder="Enter deposit amount"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <button type="submit" disabled={loading} className="deposit-btn">
                                    {loading ? 'Depositing...' : 'Deposit'}
                                </button>
                            </form>
                        </div>

                        <div className="form-box withdraw-box">
                            <h3>Withdraw Money</h3>
                            <form onSubmit={makeWithdrawal}>
                                <input
                                    type="number"
                                    value={withdrawAmount}
                                    onChange={(e) => setWithdrawAmount(e.target.value)}
                                    placeholder="Enter withdrawal amount"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                                <button type="submit" disabled={loading} className="withdraw-btn">
                                    {loading ? 'Withdrawing...' : 'Withdraw'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. TRANSACTIONS SECTION WITH IMPROVED SEARCH */}
            {selectedAccount && (
                <div className="transactions-section">
                    <h2>Recent Transactions</h2>

                    {/* Improved Search Filters */}
                    <div className="transaction-search">
                        <div className="search-filters">
                            <div className="filter-group">
                                <label htmlFor="searchType">🔍 Transaction Type:</label>
                                <select
                                    id="searchType"
                                    value={searchType}
                                    onChange={(e) => setSearchType(e.target.value)}
                                    className="search-select"
                                >
                                    <option value="all">📋 All Transactions</option>
                                    <option value="deposit">💰 Deposits Only</option>
                                    <option value="withdraw">💸 Withdrawals Only</option>
                                </select>
                            </div>

                            <div className="filter-group">
                                <label htmlFor="searchDate">📅 Select Date:</label>
                                <input
                                    type="date"
                                    id="searchDate"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                    className="search-date"
                                    max={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <button
                                onClick={clearSearchFilters}
                                className="clear-filters-btn"
                                title="Clear all search filters"
                            >
                                🗑️ Clear Filters
                            </button>
                        </div>
                    </div>

                    {/* Transaction Results */}
                    <div className="transaction-results">
                        <div className="results-summary">
                            <p className="results-count">
                                📊 Showing <strong>{filteredTransactions.length}</strong> of <strong>{transactions.length}</strong> transactions
                                {searchDate && (
                                    <span className="filter-info">
                                        {' '}on {new Date(searchDate).toLocaleDateString()}
                                    </span>
                                )}
                                {searchType !== 'all' && (
                                    <span className="filter-info">
                                        {' '}({searchType}s only)
                                    </span>
                                )}
                            </p>
                        </div>

                        {filteredTransactions.length > 0 ? (
                            <div className="transactions-container">
                                <ul className="transaction-list">
                                    {filteredTransactions.map((transaction) => {
                                        const date = transaction.timestamp ? new Date(transaction.timestamp).toLocaleString() : 'N/A';
                                        const amount = Number(transaction.amount || 0).toFixed(2);
                                        const balanceAfter = Number(transaction.balanceAfter || 0).toFixed(2);
                                        const transactionType = transaction.type.toLowerCase();

                                        return (
                                            <li key={transaction.id} className={`transaction-item ${transactionType}`}>
                                                <div className="transaction-info">
                                                    <div className="transaction-header">
                                                        <span className="transaction-type-badge">
                                                            {transactionType.includes('deposit') || transactionType.includes('credit') ? '💰' : '💸'}
                                                            {transaction.type}
                                                        </span>
                                                        <span className="transaction-date">📅 {date}</span>
                                                    </div>
                                                    <div className="transaction-details">
                                                        <span className={`transaction-amount ${transactionType.includes('deposit') || transactionType.includes('credit') ? 'positive' : 'negative'}`}>
                                                            {transactionType.includes('deposit') || transactionType.includes('credit') ? '+' : '-'}₹{amount}
                                                        </span>
                                                        {/* <span className="transaction-balance">Balance: ₹{balanceAfter}</span> */}
                                                    </div>
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ) : (
                            <div className="no-transactions">
                                <p>
                                    {transactions.length === 0
                                        ? "📭 No transactions found for this account."
                                        : "🔍 No transactions match your search criteria."}
                                </p>
                                {(searchType !== 'all' || searchDate) && (
                                    <button
                                        onClick={clearSearchFilters}
                                        className="show-all-btn"
                                    >
                                        Show All Transactions
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;