import { useState, useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import t from '../utils/translations'

const CATEGORIES = ['salary', 'rent', 'food', 'transport', 'entertainment', 'health', 'utilities', 'other']

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

const inputCls = 'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'
const selectCls = inputCls

export default function Cash({ lang }) {
  const tr = t[lang] || t.en

  const [transactions, setTransactions] = useState(() => JSON.parse(localStorage.getItem('transactions') || '[]'))

  const [amount, setAmount] = useState('')
  const [type, setType] = useState('income')
  const [category, setCategory] = useState('salary')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [description, setDescription] = useState('')

  const [filterMonth, setFilterMonth] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterCat, setFilterCat] = useState('all')

  const save = (list) => {
    setTransactions(list)
    localStorage.setItem('transactions', JSON.stringify(list))
  }

  const addTransaction = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return
    const tx = { id: Date.now(), amount: Number(amount), type, category, date, description: description.trim() }
    save([...transactions, tx])
    setAmount('')
    setDescription('')
  }

  const removeTransaction = (id) => save(transactions.filter(tx => tx.id !== id))

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filterMonth && !tx.date.startsWith(filterMonth)) return false
      if (filterType !== 'all' && tx.type !== filterType) return false
      if (filterCat !== 'all' && tx.category !== filterCat) return false
      return true
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [transactions, filterMonth, filterType, filterCat])

  const totalIn = filtered.filter(tx => tx.type === 'income').reduce((s, tx) => s + Number(tx.amount), 0)
  const totalOut = filtered.filter(tx => tx.type === 'expense').reduce((s, tx) => s + Number(tx.amount), 0)

  const monthlyData = useMemo(() => {
    const map = {}
    transactions.forEach(tx => {
      const key = tx.date.slice(0, 7)
      if (!map[key]) map[key] = { month: key, income: 0, expenses: 0 }
      if (tx.type === 'income') map[key].income += Number(tx.amount)
      else map[key].expenses += Number(tx.amount)
    })
    return Object.values(map).sort((a, b) => a.month.localeCompare(b.month)).slice(-6)
  }, [transactions])

  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const months = useMemo(() => {
    const set = new Set(transactions.map(tx => tx.date.slice(0, 7)))
    return Array.from(set).sort((a, b) => b.localeCompare(a))
  }, [transactions])

  return (
    <div className="space-y-6">
      {/* Add Transaction */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.addTransaction}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <input className={inputCls} type="number" placeholder={tr.amount} value={amount} onChange={e => setAmount(e.target.value)} min="0" />
          <select className={selectCls} value={type} onChange={e => setType(e.target.value)}>
            <option value="income">{tr.incomeLabel}</option>
            <option value="expense">{tr.expenseLabel}</option>
          </select>
          <select className={selectCls} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{tr[c] || c}</option>)}
          </select>
          <input className={inputCls} type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input className={inputCls} type="text" placeholder={tr.description} value={description} onChange={e => setDescription(e.target.value)} />
          <button
            onClick={addTransaction}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            {tr.add}
          </button>
        </div>
      </Card>

      {/* Filters + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap gap-3 mb-4">
            <select className={selectCls + ' w-auto'} value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
              <option value="">{tr.filterByMonth}: {tr.all}</option>
              {months.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select className={selectCls + ' w-auto'} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="all">{tr.filterByType}: {tr.all}</option>
              <option value="income">{tr.incomeLabel}</option>
              <option value="expense">{tr.expenseLabel}</option>
            </select>
            <select className={selectCls + ' w-auto'} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
              <option value="all">{tr.filterByCategory}: {tr.all}</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{tr[c] || c}</option>)}
            </select>
          </div>

          {filtered.length === 0 ? (
            <p className="text-gray-400 dark:text-gray-500 text-sm">{tr.noData}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-gray-500 dark:text-gray-400">
                    <th className="py-2 pe-4">{tr.date}</th>
                    <th className="py-2 pe-4">{tr.type}</th>
                    <th className="py-2 pe-4">{tr.category}</th>
                    <th className="py-2 pe-4">{tr.description}</th>
                    <th className="py-2 pe-4 text-end">{tr.amount}</th>
                    <th className="py-2" />
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx => (
                    <tr key={tx.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-2 pe-4 text-gray-600 dark:text-gray-400">{tx.date}</td>
                      <td className="py-2 pe-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${tx.type === 'income' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                          {tx.type === 'income' ? tr.incomeLabel : tr.expenseLabel}
                        </span>
                      </td>
                      <td className="py-2 pe-4 text-gray-700 dark:text-gray-300">{tr[tx.category] || tx.category}</td>
                      <td className="py-2 pe-4 text-gray-700 dark:text-gray-300">{tx.description}</td>
                      <td className={`py-2 pe-4 text-end font-semibold ${tx.type === 'income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {tx.type === 'income' ? '+' : '-'}{fmt(tx.amount)}
                      </td>
                      <td className="py-2">
                        <button onClick={() => removeTransaction(tx.id)} className="text-gray-400 hover:text-red-500 text-xs">{tr.delete}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tr.totalIn}</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">{fmt(totalIn)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tr.totalOut}</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{fmt(totalOut)}</p>
          </Card>
          <Card>
            <p className="text-sm text-gray-500 dark:text-gray-400">{tr.balance}</p>
            <p className={`text-2xl font-bold ${totalIn - totalOut >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-red-600 dark:text-red-400'}`}>
              {fmt(totalIn - totalOut)}
            </p>
          </Card>
        </div>
      </div>

      {/* Chart */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.monthlyOverview}</h2>
        {monthlyData.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">{tr.noData}</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
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
    </div>
  )
}
