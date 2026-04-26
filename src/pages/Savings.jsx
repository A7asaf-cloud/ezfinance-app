import { useState } from 'react'
import t from '../utils/translations'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

const inputCls = 'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'

export default function Savings({ lang }) {
  const tr = t[lang] || t.en

  const [goals, setGoals] = useState(() => JSON.parse(localStorage.getItem('savings') || '[]'))
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [deadline, setDeadline] = useState('')
  const [monthly, setMonthly] = useState('')
  const [editIdx, setEditIdx] = useState(null)

  const save = (list) => {
    setGoals(list)
    localStorage.setItem('savings', JSON.stringify(list))
  }

  const addGoal = () => {
    if (!name.trim() || !target || !current) return
    const goal = {
      id: Date.now(),
      name: name.trim(),
      target: Number(target),
      current: Number(current),
      deadline,
      monthly: Number(monthly) || 0,
    }
    if (editIdx !== null) {
      const updated = goals.map((g, i) => i === editIdx ? goal : g)
      save(updated)
      setEditIdx(null)
    } else {
      save([...goals, goal])
    }
    setName(''); setTarget(''); setCurrent(''); setDeadline(''); setMonthly('')
  }

  const removeGoal = (id) => save(goals.filter(g => g.id !== id))

  const startEdit = (idx) => {
    const g = goals[idx]
    setName(g.name); setTarget(g.target); setCurrent(g.current)
    setDeadline(g.deadline || ''); setMonthly(g.monthly || '')
    setEditIdx(idx)
  }

  const projectedCompletion = (goal) => {
    if (!goal.monthly || goal.monthly <= 0) return null
    const remaining = goal.target - goal.current
    if (remaining <= 0) return tr.progress + ' ✅'
    const monthsLeft = Math.ceil(remaining / goal.monthly)
    const d = new Date()
    d.setMonth(d.getMonth() + monthsLeft)
    return d.toLocaleDateString()
  }

  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

  return (
    <div className="space-y-6">
      {/* Add/Edit Goal */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
          {editIdx !== null ? tr.edit : tr.addGoal}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <input className={inputCls} type="text" placeholder={tr.goalName} value={name} onChange={e => setName(e.target.value)} />
          <input className={inputCls} type="number" placeholder={tr.targetAmount} value={target} onChange={e => setTarget(e.target.value)} min="0" />
          <input className={inputCls} type="number" placeholder={tr.currentAmount} value={current} onChange={e => setCurrent(e.target.value)} min="0" />
          <input className={inputCls} type="date" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder={tr.deadline} />
          <input className={inputCls} type="number" placeholder={tr.monthlyContribution} value={monthly} onChange={e => setMonthly(e.target.value)} min="0" />
          <div className="flex gap-2">
            <button
              onClick={addGoal}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
            >
              {editIdx !== null ? tr.save : tr.add}
            </button>
            {editIdx !== null && (
              <button
                onClick={() => { setEditIdx(null); setName(''); setTarget(''); setCurrent(''); setDeadline(''); setMonthly('') }}
                className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm"
              >
                {tr.cancel}
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <p className="text-gray-400 dark:text-gray-500 text-sm">{tr.noSavingsGoals}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((goal, idx) => {
            const pct = Math.min(100, Math.round((Number(goal.current) / Number(goal.target)) * 100))
            const barColor = pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
            const projected = projectedCompletion(goal)

            return (
              <Card key={goal.id}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{goal.name}</h3>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(idx)} className="text-blue-500 hover:text-blue-700 text-xs">{tr.edit}</button>
                    <button onClick={() => removeGoal(goal.id)} className="text-red-400 hover:text-red-600 text-xs">{tr.delete}</button>
                  </div>
                </div>

                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>{fmt(goal.current)}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{pct}%</span>
                  <span>{fmt(goal.target)}</span>
                </div>

                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 mb-3">
                  <div className={`${barColor} h-3 rounded-full transition-all`} style={{ width: `${pct}%` }} />
                </div>

                <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                  {goal.deadline && (
                    <p>{tr.deadline}: <span className="text-gray-700 dark:text-gray-300">{goal.deadline}</span></p>
                  )}
                  {goal.monthly > 0 && (
                    <p>{tr.monthlyContribution}: <span className="text-gray-700 dark:text-gray-300">{fmt(goal.monthly)}/mo</span></p>
                  )}
                  {projected && (
                    <p>{tr.projectedCompletion}: <span className="font-medium text-gray-700 dark:text-gray-300">{projected}</span></p>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
