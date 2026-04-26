import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import t from '../utils/translations'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

export default function Dashboard({ lang }) {
  const tr = t[lang] || t.en

  const transactions = useMemo(() => JSON.parse(localStorage.getItem('transactions') || '[]'), [])
  const stocks = useMemo(() => JSON.parse(localStorage.getItem('stocks') || '[]'), [])
  const savings = useMemo(() => JSON.parse(localStorage.getItem('savings') || '[]'), [])

  // Net worth = all cash + savings current + stock cost basis (no live price on dashboard)
  const cashBalance = transactions.reduce((sum, tx) => {
    return tx.type === 'income' ? sum + Number(tx.amount) : sum - Number(tx.amount)
  }, 0)
  const savingsTotal = savings.reduce((sum, g) => sum + Number(g.current || 0), 0)
  const stockCost = stocks.reduce((sum, s) => sum + Number(s.shares) * Number(s.buyPrice), 0)
  const netWorth = cashBalance + savingsTotal + stockCost

  // Monthly chart data (last 6 months)
  const monthlyData = useMemo(() => {
    const map = {}
    transactions.forEach(tx => {
      const d = new Date(tx.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 }
      if (tx.type === 'income') map[key].income += Number(tx.amount)
      else map[key].expenses += Number(tx.amount)
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [transactions])

  const recent = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)

  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      {/* Net Worth */}
      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tr.netWorth}</p>
        <p className={`text-4xl font-bold mt-1 ${netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {fmt(netWorth)}
        </p>
        <div className="flex gap-6 mt-3 text-sm text-gray-500 dark:text-gray-400">
          <span>{tr.cash}: <span className="text-gray-900 dark:text-white font-medium">{fmt(cashBalance)}</span></span>
          <span>{tr.savings}: <span className="text-gray-900 dark:text-white font-medium">{fmt(savingsTotal)}</span></span>
          <span>{tr.stocks}: <span className="text-gray-900 dark:text-white font-medium">{fmt(stockCost)}</span></span>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly chart */}
        <Card>
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.monthlyOverview}</h2>
          {monthlyData.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">{tr.noData}</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend />
                <Bar dataKey="income" name={tr.income} fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name={tr.expenses} fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">{tr.recentTransactions}</h2>
            <Link to="/cash" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">{tr.all} →</Link>
          </div>
          {recent.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">{tr.noTransactions}</p>
          ) : (
            <ul className="space-y-2">
              {recent.map((tx, i) => (
                <li key={i} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{tx.description || tx.category}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{tx.date} · {tx.category}</p>
                  </div>
                  <span className={`font-semibold text-sm ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Savings Goals */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-gray-900 dark:text-white">{tr.savingsGoals}</h2>
          <Link to="/savings" className="text-blue-600 dark:text-blue-400 text-sm hover:underline">{tr.all} →</Link>
        </div>
        {savings.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">{tr.noGoals}</p>
        ) : (
          <div className="space-y-4">
            {savings.slice(0, 3).map((goal, i) => {
              const pct = Math.min(100, Math.round((Number(goal.current) / Number(goal.target)) * 100))
              const barColor = pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-900 dark:text-white font-medium">{goal.name}</span>
                    <span className="text-gray-500 dark:text-gray-400">{fmt(goal.current)} / {fmt(goal.target)} ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className={`${barColor} h-2 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
