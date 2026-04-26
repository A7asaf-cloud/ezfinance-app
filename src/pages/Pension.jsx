import { useState, useMemo } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import t from '../utils/translations'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

const inputCls = 'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'

const STORED_KEY = 'pension_settings'

export default function Pension({ lang }) {
  const tr = t[lang] || t.en

  const stored = JSON.parse(localStorage.getItem(STORED_KEY) || 'null')

  const [myContrib, setMyContrib] = useState(stored?.myContrib || '')
  const [employerPct, setEmployerPct] = useState(stored?.employerPct || '')
  const [annualReturn, setAnnualReturn] = useState(stored?.annualReturn || '7')
  const [retirementAge, setRetirementAge] = useState(stored?.retirementAge || '67')
  const [currentAge, setCurrentAge] = useState(stored?.currentAge || '30')
  const [result, setResult] = useState(stored?.result || null)
  const [chartData, setChartData] = useState(stored?.chartData || [])

  const calculate = () => {
    const mc = Number(myContrib)
    const ep = Number(employerPct) / 100
    const r = Number(annualReturn) / 100
    const years = Number(retirementAge) - Number(currentAge)
    if (years <= 0 || mc <= 0) return

    const totalMonthly = mc + mc * ep
    const monthlyRate = r / 12
    const n = years * 12

    // FV of annuity: PMT * [(1+r)^n - 1] / r
    const fv = totalMonthly * ((Math.pow(1 + monthlyRate, n) - 1) / monthlyRate)

    const data = []
    for (let y = 0; y <= years; y++) {
      const months = y * 12
      const val = totalMonthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
      data.push({ year: Number(currentAge) + y, value: Math.round(val) })
    }

    const res = Math.round(fv)
    setResult(res)
    setChartData(data)
    localStorage.setItem(STORED_KEY, JSON.stringify({
      myContrib, employerPct, annualReturn, retirementAge, currentAge, result: res, chartData: data
    }))
  }

  const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })
  const fmtTick = (v) => v >= 1000000 ? `$${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`

  const years = Number(retirementAge) - Number(currentAge)

  return (
    <div className="space-y-6">
      {/* Inputs */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.pension}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{tr.currentAge}</label>
            <input className={inputCls} type="number" value={currentAge} onChange={e => setCurrentAge(e.target.value)} min="18" max="80" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{tr.retirementAge}</label>
            <input className={inputCls} type="number" value={retirementAge} onChange={e => setRetirementAge(e.target.value)} min="30" max="100" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{tr.monthlyContrib}</label>
            <input className={inputCls} type="number" value={myContrib} onChange={e => setMyContrib(e.target.value)} min="0" placeholder="e.g. 500" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{tr.employerMatch}</label>
            <input className={inputCls} type="number" value={employerPct} onChange={e => setEmployerPct(e.target.value)} min="0" max="200" placeholder="e.g. 50" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{tr.annualReturn}</label>
            <input className={inputCls} type="number" value={annualReturn} onChange={e => setAnnualReturn(e.target.value)} min="0" max="50" placeholder="e.g. 7" />
          </div>
        </div>
        <button
          onClick={calculate}
          className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
        >
          {tr.calculate}
        </button>
      </Card>

      {/* Result */}
      {result != null && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tr.projectedFund}</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">{fmt(result)}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">{tr.yearsToRetirement}</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-1">{years}</p>
            </Card>
            <Card>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Monthly Contribution</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {fmt(Number(myContrib) + Number(myContrib) * (Number(employerPct) / 100))}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                You: {fmt(Number(myContrib))} + Employer: {fmt(Number(myContrib) * (Number(employerPct) / 100))}
              </p>
            </Card>
          </div>

          {/* Chart */}
          <Card>
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.growthChart}</h2>
            <div dir="ltr">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tickFormatter={fmtTick} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip formatter={(v) => fmt(v)} labelFormatter={(l) => `Age ${l}`} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name={tr.projectedFund}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
