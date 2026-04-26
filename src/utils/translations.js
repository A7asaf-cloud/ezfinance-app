const t = {
  en: {
    // Nav
    dashboard: 'Dashboard', stocks: 'Stocks', cash: 'Cash',
    savings: 'Savings', pension: 'Pension', settings: 'Settings',
    logout: 'Logout', welcome: 'Welcome back', login: 'Log In',
    createAccount: 'Create Account', resetAll: 'Reset everything & start over',
    darkMode: 'Dark Mode', language: 'Language',
    // Auth
    fullName: 'Full Name', password: 'Password', confirmPassword: 'Confirm Password',
    wrongPassword: 'Wrong password. Try again.', passwordMismatch: 'Passwords do not match.',
    // Dashboard
    netWorth: 'Net Worth', recentTransactions: 'Recent Transactions',
    upcomingPayments: 'Upcoming Payments', savingsGoals: 'Savings Goals',
    monthlyOverview: 'Monthly Overview', income: 'Income', expenses: 'Expenses',
    balance: 'Balance', noTransactions: 'No transactions yet.', noGoals: 'No savings goals yet.',
    // Cash
    addTransaction: 'Add Transaction', amount: 'Amount', type: 'Type',
    category: 'Category', date: 'Date', description: 'Description', add: 'Add',
    filterByMonth: 'Month', filterByType: 'Type', filterByCategory: 'Category',
    all: 'All', totalIn: 'Total In', totalOut: 'Total Out',
    incomeLabel: 'Income', expenseLabel: 'Expense', noData: 'No data',
    // Categories
    salary: 'Salary', rent: 'Rent', food: 'Food', transport: 'Transport',
    entertainment: 'Entertainment', health: 'Health', utilities: 'Utilities', other: 'Other',
    // Stocks
    symbol: 'Symbol', shares: 'Shares', buyPrice: 'Buy Price ($)',
    currentPrice: 'Current Price', todayChange: "Today's Change", totalValue: 'Total Value',
    pnl: 'P&L', lastUpdated: 'Last updated', portfolioTotal: 'Portfolio Total',
    addStock: 'Add Stock', loading: 'Loading...', remove: 'Remove',
    noStocks: 'No stocks in portfolio yet.',
    // Savings
    goalName: 'Goal Name', targetAmount: 'Target ($)', currentAmount: 'Current ($)',
    deadline: 'Deadline', monthlyContribution: 'Monthly Contribution ($)',
    addGoal: 'Add Goal', progress: 'Progress', projectedCompletion: 'Projected Completion',
    noSavingsGoals: 'No savings goals yet.',
    // Pension
    monthlyContrib: 'My Monthly Contribution ($)', employerMatch: 'Employer Match (%)',
    annualReturn: 'Expected Annual Return (%)', retirementAge: 'Retirement Age',
    currentAge: 'Current Age', calculate: 'Calculate',
    projectedFund: 'Projected Retirement Fund', growthChart: 'Growth Over Time',
    yearsToRetirement: 'Years to retirement',
    // Settings
    changePassword: 'Change Password', currentPassword: 'Current Password',
    newPassword: 'New Password', confirmNewPassword: 'Confirm New Password',
    savePassword: 'Save Password', exportData: 'Export All Data as JSON',
    resetEverything: 'Reset Everything', passwordChanged: 'Password changed successfully!',
    passwordWrong: 'Current password is wrong.', passwordShort: 'New password too short.',
    edit: 'Edit', delete: 'Delete', cancel: 'Cancel', save: 'Save',
    hi: 'Hi',
    data: 'Data',
  },
  he: {
    // Nav
    dashboard: 'לוח בקרה', stocks: 'מניות', cash: 'מזומן',
    savings: 'חסכונות', pension: 'פנסיה', settings: 'הגדרות',
    logout: 'התנתק', welcome: 'ברוך שובך', login: 'כניסה',
    createAccount: 'צור חשבון', resetAll: 'אפס הכל והתחל מחדש',
    darkMode: 'מצב לילה', language: 'שפה',
    // Auth
    fullName: 'שם מלא', password: 'סיסמה', confirmPassword: 'אשר סיסמה',
    wrongPassword: 'סיסמה שגויה. נסה שוב.', passwordMismatch: 'הסיסמאות אינן תואמות.',
    // Dashboard
    netWorth: 'שווי נקי', recentTransactions: 'עסקאות אחרונות',
    upcomingPayments: 'תשלומים קרובים', savingsGoals: 'יעדי חיסכון',
    monthlyOverview: 'סיכום חודשי', income: 'הכנסות', expenses: 'הוצאות',
    balance: 'יתרה', noTransactions: 'אין עסקאות עדיין.', noGoals: 'אין יעדי חיסכון עדיין.',
    // Cash
    addTransaction: 'הוסף עסקה', amount: 'סכום', type: 'סוג',
    category: 'קטגוריה', date: 'תאריך', description: 'תיאור', add: 'הוסף',
    filterByMonth: 'חודש', filterByType: 'סוג', filterByCategory: 'קטגוריה',
    all: 'הכל', totalIn: 'סה"כ כניסה', totalOut: 'סה"כ יציאה',
    incomeLabel: 'הכנסה', expenseLabel: 'הוצאה', noData: 'אין נתונים',
    // Categories
    salary: 'משכורת', rent: 'שכירות', food: 'אוכל', transport: 'תחבורה',
    entertainment: 'בידור', health: 'בריאות', utilities: 'חשבונות', other: 'אחר',
    // Stocks
    symbol: 'סימבול', shares: 'מניות', buyPrice: 'מחיר קנייה ($)',
    currentPrice: 'מחיר נוכחי', todayChange: 'שינוי היום', totalValue: 'שווי כולל',
    pnl: 'רווח/הפסד', lastUpdated: 'עודכן לאחרונה', portfolioTotal: 'סה"כ תיק',
    addStock: 'הוסף מניה', loading: 'טוען...', remove: 'הסר',
    noStocks: 'אין מניות בתיק עדיין.',
    // Savings
    goalName: 'שם יעד', targetAmount: 'יעד ($)', currentAmount: 'נוכחי ($)',
    deadline: 'תאריך יעד', monthlyContribution: 'הפקדה חודשית ($)',
    addGoal: 'הוסף יעד', progress: 'התקדמות', projectedCompletion: 'השלמה משוערת',
    noSavingsGoals: 'אין יעדי חיסכון עדיין.',
    // Pension
    monthlyContrib: 'הפקדה חודשית שלי ($)', employerMatch: 'הפקדת מעסיק (%)',
    annualReturn: 'תשואה שנתית משוערת (%)', retirementAge: 'גיל פרישה',
    currentAge: 'גיל נוכחי', calculate: 'חשב',
    projectedFund: 'קרן פרישה משוערת', growthChart: 'גדילה לאורך זמן',
    yearsToRetirement: 'שנים לפרישה',
    // Settings
    changePassword: 'שנה סיסמה', currentPassword: 'סיסמה נוכחית',
    newPassword: 'סיסמה חדשה', confirmNewPassword: 'אשר סיסמה חדשה',
    savePassword: 'שמור סיסמה', exportData: 'ייצא את כל הנתונים כ-JSON',
    resetEverything: 'אפס הכל', passwordChanged: 'הסיסמה שונתה בהצלחה!',
    passwordWrong: 'הסיסמה הנוכחית שגויה.', passwordShort: 'הסיסמה החדשה קצרה מדי.',
    edit: 'ערוך', delete: 'מחק', cancel: 'בטל', save: 'שמור',
    hi: 'שלום',
    data: 'נתונים',
  }
}

export default t
