import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    
    const [stats, setStats] = useState({});

    
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userAccount, setUserAccount] = useState(null);
    const [userTransactions, setUserTransactions] = useState([]);

    
    const [allAccounts, setAllAccounts] = useState([]);

  
    const [allTransactions, setAllTransactions] = useState([]);
    const [filteredTransactions, setFilteredTransactions] = useState([]);
    const [transactionFilter, setTransactionFilter] = useState('all');
    const [transactionDate, setTransactionDate] = useState('');

    const [adminAmount, setAdminAmount] = useState('');
    const [operationType, setOperationType] = useState('deposit');

    const [userOperations, setUserOperations] = useState({
        amount: '',
        operationType: 'deposit'
    });

    const token = localStorage.getItem('token');

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            return date.toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getUserRole = (user) => {
        if (!user) return 'N/A';
        return user.role || user.userRole || 'USER';
    };

    const getAccountOwner = (account) => {
        if (!account) return 'N/A';
        if (account.user && account.user.username) {
            return account.user.username;
        }
        if (account.username) {
            return account.username;
        }
        if (account.ownerName) {
            return account.ownerName;
        }
        return 'Unknown User';
    };

    useEffect(() => {
        if (activeTab === 'stats') {
            fetchStats();
        } else if (activeTab === 'users') {
            fetchUsers();
        } else if (activeTab === 'accounts') {
            fetchAllAccounts();
        } else if (activeTab === 'transactions') {
            fetchAllTransactions();
        }
    }, [activeTab]);

   
    useEffect(() => {
        let filtered = [...allTransactions];

        if (transactionFilter !== 'all') {
            filtered = filtered.filter(transaction =>
                transaction.type && transaction.type.toLowerCase() === transactionFilter.toLowerCase()
            );
        }

        if (transactionDate) {
            const selectedDate = new Date(transactionDate);
            selectedDate.setHours(0, 0, 0, 0);

            filtered = filtered.filter(transaction => {
                if (!transaction.timestamp) return false;
                try {
                    const transactionDate = new Date(transaction.timestamp);
                    transactionDate.setHours(0, 0, 0, 0);
                    return transactionDate.getTime() === selectedDate.getTime();
                } catch (error) {
                    return false;
                }
            });
        }

        setFilteredTransactions(filtered);
    }, [allTransactions, transactionFilter, transactionDate]);

    const clearMessages = () => {
        setError(null);
        setSuccess(null);
    };

    const handleError = (err, defaultMessage) => {
        clearMessages();
        console.error('API Error:', err);
        if (err.response && err.response.data) {
            const errorMessage = err.response.data.message || err.response.data.error || err.response.data;
            setError(typeof errorMessage === 'string' ? errorMessage : defaultMessage);
        } else {
            setError(defaultMessage);
        }
    };

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/admin/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Stats data:', response.data);
            setStats(response.data || {});
        } catch (err) {
            handleError(err, 'Failed to fetch system statistics');
        } finally {
            setLoading(false);
        }
    };

    // Fetch all users
    // const fetchUsers = async () => {
    //     setLoading(true);
    //     try {
    //         const response = await axios.get('http://localhost:8080/api/admin/users', {
    //             headers: { Authorization: `Bearer ${token}` },
    //         });
    //         console.log('Users data:', response.data);
    //         setUsers(Array.isArray(response.data) ? response.data : []);
    //     } catch (err) {
    //         handleError(err, 'Failed to fetch users');
    //     } finally {
    //         setLoading(false);
    //     }
    // };
   
const fetchUsers = async () => {
  setLoading(true);
  try {
    const response = await axios.get('http://localhost:8080/api/admin/users', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const sortedUsers = response.data.sort((a, b) => b.id - a.id);
    setUsers(sortedUsers);
  } catch (err) {
    handleError(err, 'Failed to fetch users');
  } finally {
    setLoading(false);
  }
};


    const fetchAllAccounts = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/admin/accounts', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Accounts data:', response.data);
            setAllAccounts(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            handleError(err, 'Failed to fetch accounts');
        } finally {
            setLoading(false);
        }
    };

    const fetchAllTransactions = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8080/api/admin/transactions', {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Transactions data:', response.data);
            setAllTransactions(Array.isArray(response.data) ? response.data : []);
        } catch (err) {
            handleError(err, 'Failed to fetch transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetails = async (userId) => {
        setLoading(true);
        try {
          
            const accountResponse = await axios.get(`http://localhost:8080/api/admin/users/${userId}/account`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('User account data:', accountResponse.data);
            setUserAccount(accountResponse.data || null);

            const transactionsResponse = await axios.get(`http://localhost:8080/api/admin/users/${userId}/transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('User transactions data:', transactionsResponse.data);
            setUserTransactions(Array.isArray(transactionsResponse.data) ? transactionsResponse.data : []);
        } catch (err) {
            handleError(err, 'Failed to fetch user details');
        } finally {
            setLoading(false);
        }
    };

    const handleUserSelect = (user) => {
        setSelectedUser(user);
        fetchUserDetails(user.id);
        clearMessages();
    };

    // Admin deposit/withdraw operations
    const handleAdminOperation = async (e) => {
        e.preventDefault();
        if (!selectedUser || !adminAmount) return;

        setLoading(true);
        try {
            const endpoint = operationType === 'deposit' ? 'deposit' : 'withdraw';
            await axios.post(
                `http://localhost:8080/api/admin/users/${selectedUser.id}/${endpoint}`,
                null,
                {
                    params: { amount: parseFloat(adminAmount) },
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            setSuccess(`${operationType} successful for user ${selectedUser.username}`);
            setAdminAmount('');

           
            fetchUserDetails(selectedUser.id);

            if (activeTab === 'stats') {
                fetchStats();
            }
        } catch (err) {
            handleError(err, `Failed to ${operationType}`);
        } finally {
            setLoading(false);
        }
    };




    const handleDeleteUser = async (userId, username) => {
        try {
            
            const userAccountsResponse = await axios.get(`http://localhost:8080/api/admin/users/${userId}/account`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const userAccount = userAccountsResponse.data || {};

            
            if (userAccount.balance && parseFloat(userAccount.balance) !== 0) {
                setError(`Cannot delete user "${username}". User has a balance of ₹${parseFloat(userAccount.balance).toFixed(2)}. Please transfer or withdraw all funds first.`);
                return;
            }

            
            const confirmationMessage = `Are you sure you want to delete user "${username}"? This will permanently delete the user account and login credentials.`;
            if (!window.confirm(confirmationMessage)) {
                return;
            }

            
            await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setSuccess(`User "${username}" deleted successfully`);
            fetchUsers();
        } catch (err) {
            handleError(err, 'Failed to delete user');
        }
    };


   
    const performUserDeletion = async (userId, username) => {
        setLoading(true);
        try {
           
            await axios.post(`http://localhost:8080/api/admin/users/${userId}/close-accounts`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await axios.post(`http://localhost:8080/api/admin/users/${userId}/archive-transactions`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            await axios.delete(`http://localhost:8080/api/admin/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess(`User "${username}" and all associated accounts have been safely deleted and archived.`);

            if (selectedUser && selectedUser.id === userId) {
                setSelectedUser(null);
                setUserAccount(null);
                setUserTransactions([]);
            }

            fetchUsers();
            fetchStats();

        } catch (err) {
            handleError(err, 'Failed to delete user safely');
        } finally {
            setLoading(false);
        }
    };

    const canDeleteUser = (user, userAccount, userTransactions) => {
        const hasBalance = userAccount && parseFloat(userAccount.balance || 0) !== 0;
        const hasPendingTransactions = userTransactions.some(t => t.status === 'PENDING' || t.status === 'PROCESSING');

        return !hasBalance && !hasPendingTransactions;
    };

    const renderUserDeletionButton = (user) => {
        const deletable = canDeleteUser(user, userAccount, userTransactions);

        return (
            <button
                className={`delete-user-btn ${!deletable ? 'disabled' : ''}`}
                onClick={(e) => {
                    e.stopPropagation();
                    if (deletable) {
                        handleDeleteUser(user.id, user.username || 'Unknown User');
                    } else {
                        setError('User cannot be deleted. Please resolve balance or pending transactions first.');
                    }
                }}
                disabled={!deletable}
                title={deletable ? 'Delete user' : 'Cannot delete: User has balance or pending transactions'}
            >
                {deletable ? '🗑️' : '🚫'}
            </button>
        );
    };

    const handleCloseAccount = async (accountId, userId) => {
        try {
            const account = allAccounts.find(acc => acc.id === accountId);
            if (!account) {
                setError('Account not found');
                return;
            }

            const balance = parseFloat(account.balance || 0);
            if (balance !== 0) {
                setError(`Cannot close account. Current balance: ₹${balance.toFixed(2)}. Please transfer or withdraw all funds first.`);
                return;
            }

            if (!window.confirm(`Close account ${account.accountNumber}? This will prevent all future transactions.`)) {
                return;
            }

            await axios.post(`http://localhost:8080/api/admin/accounts/${accountId}/close`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setSuccess('Account closed successfully. User account remains active.');

            fetchAllAccounts();
            if (selectedUser && selectedUser.id === userId) {
                fetchUserDetails(userId);
            }

        } catch (err) {
            handleError(err, 'Failed to close account');
        }
    };

    const handleUserOperation = async (e) => {
        e.preventDefault();
        if (!userOperations.amount) return;

        setLoading(true);
        clearMessages();

        try {
            const endpoint = `http://localhost:8080/api/users/${userOperations.operationType}`;

            const response = await axios.post(endpoint, null, {
                params: { amount: parseFloat(userOperations.amount) },
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 200) {
                const message = response.data.message || `${userOperations.operationType} successful`;
                setSuccess(message);
                setUserOperations({ ...userOperations, amount: '' });

                // Refresh current tab data
                if (activeTab === 'stats') fetchStats();
                if (activeTab === 'accounts') fetchAllAccounts();
                if (activeTab === 'transactions') fetchAllTransactions();
            }
        } catch (error) {
            handleError(error, `Failed to ${userOperations.operationType} money`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Admin Dashboard</h1>
                <div className="tab-navigation">
                    <button
                        className={activeTab === 'stats' ? 'active' : ''}
                        onClick={() => setActiveTab('stats')}
                    >
                        Statistics
                    </button>
                    <button
                        className={activeTab === 'users' ? 'active' : ''}
                        onClick={() => setActiveTab('users')}
                    >
                        Users
                    </button>
                    <button
                        className={activeTab === 'accounts' ? 'active' : ''}
                        onClick={() => setActiveTab('accounts')}
                    >
                        Accounts
                    </button>
                    <button
                        className={activeTab === 'transactions' ? 'active' : ''}
                        onClick={() => setActiveTab('transactions')}
                    >
                        Transactions
                    </button>
                </div>
            </div>

            {loading && <div className="loading">Loading...</div>}

            {error && (
                <div className="error-message">
                    <span>{error}</span>
                    <button onClick={clearMessages}>×</button>
                </div>
            )}

            {success && (
                <div className="success-message">
                    <span>{success}</span>
                    <button onClick={clearMessages}>×</button>
                </div>
            )}

            <div className="admin-content">
                {/* Statistics Tab */}
                {activeTab === 'stats' && (
                    <div className="stats-section">
                        <h2>System Statistics</h2>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <h3>Total Users</h3>
                                <p className="stat-number">{stats.totalUsers || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Accounts</h3>
                                <p className="stat-number">{stats.totalAccounts || 0}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Balance</h3>
                                <p className="stat-number">₹{(stats.totalBalance || 0).toFixed(2)}</p>
                            </div>
                            <div className="stat-card">
                                <h3>Total Transactions</h3>
                                <p className="stat-number">{stats.totalTransactions || 0}</p>
                            </div>
                            {/* <div className="stat-card">
                                <h3>Daily Transactions</h3>
                                <p className="stat-number">{stats.dailyTransactions || 0}</p>
                            </div> */}
                            {/* <div className="stat-card">
                                <h3>Monthly Volume</h3>
                                <p className="stat-number">₹{(stats.monthlyVolume || 0).toFixed(2)}</p>
                            </div> */}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="users-section">
                        <h2>User Management</h2>
                        <div className="users-layout">
                            <div className="users-list">
                                <h3>All Users ({users.length})</h3>
                                {users.length === 0 ? (
                                    <p>No users found</p>
                                ) : (
                                    <div className="users-table">
                                        {users.map(user => (
                                            <div
                                                key={user.id}
                                                className={`user-row ${selectedUser?.id === user.id ? 'selected' : ''}`}
                                                onClick={() => handleUserSelect(user)}
                                            >
                                                <div className="user-info">
                                                    <strong>{user.username || 'N/A'}</strong>
                                                    <span className="user-role">{getUserRole(user)}</span>
                                                    {/* <span className="user-date">Joined: {formatDate(user.createdAt)}</span> */}
                                                </div>
                                                <div className="user-actions">
                                                    {selectedUser?.id === user.id && renderUserDeletionButton(user)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* User Details Panel */}
                            {selectedUser && (
                                <div className="user-details">
                                    <h3>User Details: {selectedUser.username}</h3>
                                    {/* User Info */}
                                    <div className="user-info-section">
                                        <h4>Basic Information</h4>
                                        <p><strong>ID:</strong> {selectedUser.id}</p>
                                        <p><strong>Username:</strong> {selectedUser.username || 'N/A'}</p>
                                        <p><strong>Role:</strong> {getUserRole(selectedUser)}</p>

                                    </div>
                                    {/* Account Info */}
                                    {userAccount && (
                                        <div className="account-info-section">
                                            <h4>Account Information</h4>
                                            <p><strong>Account Number:</strong> {userAccount.accountNumber || 'N/A'}</p>
                                            <p><strong>Balance:</strong> ₹{(userAccount.balance || 0).toFixed(2)}</p>
                                            <p><strong>Account Type:</strong> {userAccount.accountType || 'SAVINGS'}</p>
                                            <p><strong>Status:</strong> {userAccount.status || 'ACTIVE'}</p>
                                            {/* Find first and last transactions */}
                                            {userTransactions.length > 0 && (
                                                <>
                                                    <p><strong>Created:</strong> {formatDateTime(userTransactions.reduce((earliest, current) => {
                                                        return new Date(earliest.timestamp) < new Date(current.timestamp) ? earliest : current;
                                                    }).timestamp)}</p>
                                                    <p><strong>Updated:</strong> {formatDateTime(userTransactions.reduce((latest, current) => {
                                                        return new Date(latest.timestamp) > new Date(current.timestamp) ? latest : current;
                                                    }).timestamp)}</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                    {/* Admin Operations */}
                                    <div className="admin-operations">
                                        <h4>Admin Operations</h4>
                                        <form onSubmit={handleAdminOperation} className="operation-form">
                                            <div className="form-group">
                                                <label>Operation Type:</label>
                                                <select value={operationType} onChange={(e) => setOperationType(e.target.value)}>
                                                    <option value="deposit">Deposit</option>
                                                    <option value="withdraw">Withdraw</option>
                                                </select>
                                            </div>
                                            <div className="form-group">
                                                <label>Amount:</label>
                                                <input type="number" value={adminAmount} onChange={(e) => setAdminAmount(e.target.value)} placeholder="Enter amount" step="0.01" min="0" required />
                                            </div>
                                            <button type="submit" disabled={loading || !adminAmount}>
                                                {operationType === 'deposit' ? 'Deposit' : 'Withdraw'} Money
                                            </button>
                                        </form>
                                    </div>
                                    {/* User Transactions */}
                                    <div className="user-transactions">
                                        <h4>Recent Transactions ({userTransactions.length})</h4>
                                        {userTransactions.length === 0 ? (
                                            <p>No transactions found</p>
                                        ) : (
                                            <div className="transactions-table">
                                                {userTransactions.slice(0, 10).map(transaction => (
                                                    <div key={transaction.id} className="transaction-row">
                                                        <div className="transaction-info">
                                                            <strong>{transaction.type || 'N/A'}</strong>
                                                            <span className="amount">₹{(transaction.amount || 0).toFixed(2)}</span>
                                                            <span className="date">{formatDateTime(transaction.timestamp)}</span>
                                                            <span className={`status ${(transaction.status || 'unknown').toLowerCase()}`}>
                                                                {transaction.status || 'N/A'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}


                {/* Accounts Tab */}
                {activeTab === 'accounts' && (
                    <div className="accounts-section">
                        <h2>All Accounts ({allAccounts.length})</h2>
                        {allAccounts.length === 0 ? (
                            <p>No accounts found</p>
                        ) : (
                            <div className="accounts-table">
                                {allAccounts.map(account => {
                                    // Find the first transaction for this account
                                    const transactionsForAccount = allTransactions.filter(t => t.account && t.account.id === account.id);
                                    const firstTransaction = transactionsForAccount.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))[0];
                                    const user = firstTransaction ? firstTransaction.user : null;
                                    return (
                                        <div key={account.id} className="account-row">
                                            <div className="account-info">
                                                <strong>Account: {account.accountNumber || 'N/A'}</strong>
                                                <span className="username">User: {user ? user.username : 'Unknown User'}</span>
                                                <span className="balance">Balance: ₹{(account.balance || 0).toFixed(2)}</span>
                                                <span className="type">Type: {account.accountType || 'SAVINGS'}</span>
                                                <span className={`status ${(account.status || 'active').toLowerCase()}`}>
                                                    {account.status || 'ACTIVE'}
                                                </span>
                                                <span className="date">Created: {firstTransaction ? formatDateTime(firstTransaction.timestamp) : 'N/A'}</span>
                                            </div>
                                            <div className="account-actions">
                                                {account.status === 'ACTIVE' && (
                                                    <button className="close-account-btn" onClick={() => handleCloseAccount(account.id)} title="Close Account" >
                                                        Close
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Transactions Tab */}
                {activeTab === 'transactions' && (
                    <div className="transactions-section">
                        <h2>All Transactions</h2>
                        {/* Transaction Filters */}
                        <div className="transaction-filters">
                            <div className="filter-group">
                                <label>Filter by Type:</label>
                                <select value={transactionFilter} onChange={(e) => setTransactionFilter(e.target.value)}>
                                    <option value="all">All Types</option>
                                    <option value="deposit">Deposits</option>
                                    <option value="withdrawal">Withdrawal</option>
                                    {/* <option value="transfer">Transfers</option> */}
                                </select>
                            </div>
                            <div className="filter-group">
                                <label>Filter by Date:</label>
                                <input type="date" value={transactionDate} onChange={(e) => setTransactionDate(e.target.value)} />
                            </div>
                            <button className="clear-filters" onClick={() => { setTransactionFilter('all'); setTransactionDate(''); }}>
                                Clear Filters
                            </button>
                        </div>
                        <div className="transactions-summary">
                            <p>Showing {filteredTransactions.length} of {allTransactions.length} transactions</p>
                        </div>
                        {filteredTransactions.length === 0 ? (
                            <p>No transactions found</p>
                        ) : (
                            <div className="transactions-table">
                                {filteredTransactions.map(transaction => (
                                    <div key={transaction.id} className="transaction-row">
                                        <div className="transaction-info">
                                            <div className="transaction-main">
                                                <strong>{transaction.type || 'N/A'}</strong>
                                                <span className="transaction-id">ID: {transaction.id}</span>
                                            </div>
                                            <div className="transaction-details">
                                                <span className="amount">₹{(transaction.amount || 0).toFixed(2)}</span>
                                                <span className="account">
                                                    Account: {transaction.account ? transaction.account.accountNumber : 'N/A'}
                                                </span>
                                                {transaction.toAccount && (
                                                    <span className="to-account">To: {transaction.toAccount}</span>
                                                )}
                                                <span className="date">{formatDateTime(transaction.timestamp)}</span>
                                                {/* <span className={`status ${(transaction.status || 'unknown').toLowerCase()}`}>
                  {transaction.status || 'N/A'}
                </span> */}
                                            </div>
                                            {transaction.description && (
                                                <div className="transaction-description">
                                                    Description: {transaction.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;