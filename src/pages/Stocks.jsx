import { useState, useEffect, useCallback } from 'react'
import t from '../utils/translations'

function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  )
}

const inputCls = 'px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full'

// Fetch with timeout helper
function fetchWithTimeout(url, ms = 9000) {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id))
}

// Try multiple proxies + endpoints for Yahoo Finance
async function fetchLivePrice(symbol) {
  const sym = symbol.toUpperCase()
  const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`
  const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${sym}`

  const parseChart = (json) => {
    const meta = json?.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) throw new Error('no price')
    return { price: meta.regularMarketPrice, prevClose: meta.chartPreviousClose }
  }

  const parseQuote = (json) => {
    const q = json?.quoteResponse?.result?.[0]
    if (!q?.regularMarketPrice) throw new Error('no price')
    return { price: q.regularMarketPrice, prevClose: q.regularMarketPreviousClose }
  }

  const attempts = [
    // 1. corsproxy.io — chart v8
    { url: `https://corsproxy.io/?${chartUrl}`, parse: parseChart },
    // 2. allorigins — chart v8
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(chartUrl)}`, parse: parseChart },
    // 3. corsproxy.io — quote v7
    { url: `https://corsproxy.io/?${quoteUrl}`, parse: parseQuote },
    // 4. allorigins — quote v7
    { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(quoteUrl)}`, parse: parseQuote },
    // 5. corsproxy.io — query2 mirror
    { url: `https://corsproxy.io/?https://query2.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, parse: parseChart },
  ]

  for (const { url, parse } of attempts) {
    try {
      const res = await fetchWithTimeout(url, 9000)
      if (!res.ok) continue
      const json = await res.json()
      const result = parse(json)
      return result
    } catch {
      // try next
    }
  }
  return null
}

const CACHE_KEY = 'stocks_price_cache'

export default function Stocks({ lang }) {
  const tr = t[lang] || t.en

  const [portfolio, setPortfolio] = useState(
    () => JSON.parse(localStorage.getItem('stocks') || '[]')
  )

  // Seed livePrices from cache so table isn't empty on load
  const [livePrices, setLivePrices] = useState(
    () => JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  )
  const [loading, setLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [fetchErrors, setFetchErrors] = useState({})

  const [symbol, setSymbol] = useState('')
  const [shares, setShares] = useState('')
  const [buyPrice, setBuyPrice] = useState('')

  const savePortfolio = (list) => {
    setPortfolio(list)
    localStorage.setItem('stocks', JSON.stringify(list))
  }

  const refreshAll = useCallback(async (overrideList) => {
    const target = overrideList ?? JSON.parse(localStorage.getItem('stocks') || '[]')
    if (target.length === 0) return
    setLoading(true)

    const results = await Promise.all(
      target.map(async (s) => {
        const data = await fetchLivePrice(s.symbol)
        return { symbol: s.symbol, data }
      })
    )

    setLivePrices(prev => {
      const updated = { ...prev }
      results.forEach(({ symbol: sym, data }) => {
        if (data) updated[sym] = data
      })
      localStorage.setItem(CACHE_KEY, JSON.stringify(updated))
      return updated
    })

    setFetchErrors(prev => {
      const errs = { ...prev }
      results.forEach(({ symbol: sym, data }) => {
        errs[sym] = !data
      })
      return errs
    })

    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
  }, [])

  // Auto-refresh on mount and every 60s
  useEffect(() => {
    refreshAll()
    const id = setInterval(refreshAll, 60000)
    return () => clearInterval(id)
  }, [refreshAll, portfolio])

  const addStock = async () => {
    if (!symbol.trim() || !shares || !buyPrice) return
    if (isNaN(Number(shares)) || isNaN(Number(buyPrice))) return
    const sym = symbol.trim().toUpperCase()
    // Prevent duplicate symbols
    if (portfolio.find(s => s.symbol === sym)) {
      alert(`${sym} already in portfolio`)
      return
    }
    const newStock = { symbol: sym, shares: Number(shares), buyPrice: Number(buyPrice) }
    const newList = [...portfolio, newStock]
    savePortfolio(newList)
    setSymbol(''); setShares(''); setBuyPrice('')

    // Fetch price for new stock immediately
    setLoading(true)
    const data = await fetchLivePrice(sym)
    if (data) {
      setLivePrices(prev => {
        const updated = { ...prev, [sym]: data }
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated))
        return updated
      })
      setFetchErrors(prev => ({ ...prev, [sym]: false }))
    } else {
      setFetchErrors(prev => ({ ...prev, [sym]: true }))
    }
    setLastUpdated(new Date().toLocaleTimeString())
    setLoading(false)
  }

  const removeStock = (idx) => {
    const newList = portfolio.filter((_, i) => i !== idx)
    savePortfolio(newList)
  }

  const fmt = (n, dec = 2) =>
    '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
  const fmtPct = (n) => (n >= 0 ? '+' : '') + Number(n).toFixed(2) + '%'

  let portfolioTotalValue = 0
  let portfolioTotalPnl = 0

  return (
    <div className="space-y-6">
      {/* Add Stock */}
      <Card>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-4">{tr.addStock}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <input
            className={inputCls}
            type="text"
            placeholder={`${tr.symbol} (e.g. AAPL)`}
            value={symbol}
            onChange={e => setSymbol(e.target.value.toUpperCase())}
          />
          <input
            className={inputCls}
            type="number"
            placeholder={tr.shares}
            value={shares}
            onChange={e => setShares(e.target.value)}
            min="0"
          />
          <input
            className={inputCls}
            type="number"
            placeholder={tr.buyPrice}
            value={buyPrice}
            onChange={e => setBuyPrice(e.target.value)}
            min="0"
          />
          <button
            onClick={addStock}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition"
          >
            {tr.add}
          </button>
        </div>
      </Card>

      {/* Portfolio Table */}
      <Card>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
          <h2 className="font-semibold text-gray-900 dark:text-white">{tr.stocks}</h2>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {tr.lastUpdated}: {lastUpdated}
              </span>
            )}
            {loading && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-500">
                <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>
                {tr.loading}
              </span>
            )}
            <button
              onClick={() => refreshAll()}
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {portfolio.length === 0 ? (
          <p className="text-gray-400 dark:text-gray-500 text-sm">{tr.noStocks}</p>
        ) : (
          <div className="overflow-x-auto" dir="ltr">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-left">
                  <th className="py-2 pe-4">{tr.symbol}</th>
                  <th className="py-2 pe-4 text-end">{tr.shares}</th>
                  <th className="py-2 pe-4 text-end">{tr.buyPrice}</th>
                  <th className="py-2 pe-4 text-end">{tr.currentPrice}</th>
                  <th className="py-2 pe-4 text-end">{tr.todayChange}</th>
                  <th className="py-2 pe-4 text-end">{tr.totalValue}</th>
                  <th className="py-2 pe-4 text-end">{tr.pnl}</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {portfolio.map((stock, idx) => {
                  const lp = livePrices[stock.symbol]
                  const hasError = fetchErrors[stock.symbol]
                  const currentPrice = lp?.price
                  const prevClose = lp?.prevClose

                  const todayChange = currentPrice != null && prevClose != null
                    ? currentPrice - prevClose : null
                  const todayChangePct = todayChange != null && prevClose
                    ? (todayChange / prevClose) * 100 : null
                  const totalValue = currentPrice != null
                    ? stock.shares * currentPrice : null
                  const pnl = totalValue != null
                    ? totalValue - stock.shares * stock.buyPrice : null
                  const pnlPct = pnl != null
                    ? (pnl / (stock.shares * stock.buyPrice)) * 100 : null

                  if (totalValue != null) portfolioTotalValue += totalValue
                  if (pnl != null) portfolioTotalPnl += pnl

                  return (
                    <tr key={idx} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 pe-4 font-bold text-gray-900 dark:text-white">
                        {hasError && currentPrice == null && (
                          <span title="Could not fetch price" className="me-1">⚠️</span>
                        )}
                        {hasError && currentPrice != null && (
                          <span title="Showing cached price" className="me-1 text-yellow-500">📌</span>
                        )}
                        {stock.symbol}
                      </td>
                      <td className="py-3 pe-4 text-end text-gray-700 dark:text-gray-300">{stock.shares}</td>
                      <td className="py-3 pe-4 text-end text-gray-700 dark:text-gray-300">{fmt(stock.buyPrice)}</td>
                      <td className="py-3 pe-4 text-end font-medium text-gray-900 dark:text-white">
                        {currentPrice != null
                          ? fmt(currentPrice)
                          : <span className="text-yellow-500 text-xs">{loading ? '...' : 'Fetching'}</span>}
                      </td>
                      <td className={`py-3 pe-4 text-end font-medium ${
                        todayChange == null ? '' : todayChange >= 0
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {todayChange != null ? (
                          <>{todayChange >= 0 ? '+' : ''}{fmt(todayChange)} <span className="text-xs">({fmtPct(todayChangePct)})</span></>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3 pe-4 text-end font-medium text-gray-900 dark:text-white">
                        {totalValue != null ? fmt(totalValue) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className={`py-3 pe-4 text-end font-medium ${
                        pnl == null ? ''
                          : pnl >= 0 ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {pnl != null ? (
                          <>{pnl >= 0 ? '+' : ''}{fmt(pnl)} <span className="text-xs">({fmtPct(pnlPct)})</span></>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => removeStock(idx)}
                          className="text-gray-400 hover:text-red-500 text-xs transition"
                        >
                          {tr.remove}
                        </button>
                      </td>
                    </tr>
                  )
                })}

                {/* Total Row */}
                <tr className="bg-gray-50 dark:bg-gray-800/50 font-bold border-t-2 border-gray-200 dark:border-gray-700">
                  <td className="py-3 pe-4 text-gray-900 dark:text-white" colSpan={5}>{tr.portfolioTotal}</td>
                  <td className="py-3 pe-4 text-end text-gray-900 dark:text-white">{fmt(portfolioTotalValue)}</td>
                  <td className={`py-3 pe-4 text-end ${portfolioTotalPnl >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {portfolioTotalPnl >= 0 ? '+' : ''}{fmt(portfolioTotalPnl)}
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
