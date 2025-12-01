const el = (id) => document.getElementById(id)

const state = {
  user: null,
  categories: [],
  accounts: [],
  transactions: [],
  budgets: [],
  editingAccountId: null,
  editingBudgetId: null,
  budgetFilter: { month: null, year: null }
}

const BACKEND_PORT = "5000"
const API_BASE = window.location.port === BACKEND_PORT ? "" : "http://127.0.0.1:5000"
const IS_WRONG_PORT = API_BASE !== ""

const THEME_KEY = "pf-theme"
let activeTheme = "light"

function toggleButtonLoading(button, isLoading) {
  if (!button) return
  if (isLoading) {
    button.classList.add("is-loading")
    button.disabled = true
  } else {
    button.classList.remove("is-loading")
    button.disabled = false
  }
}

function setFormMessage(id, message) {
  const target = id ? el(id) : null
  if (!target) return
  target.textContent = message || ""
}

function getPreferredTheme() {
  const stored = localStorage.getItem(THEME_KEY)
  if (stored) return stored
  if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark"
  }
  return "light"
}

function applyTheme(theme) {
  activeTheme = theme
  document.documentElement.setAttribute("data-theme", theme)
  const toggle = el("themeToggle")
  if (toggle) {
    const icon = toggle.querySelector(".themeToggle__icon")
    const label = toggle.querySelector(".themeToggle__label")
    if (icon) icon.textContent = theme === "dark" ? "☀️" : "🌙"
    if (label) label.textContent = theme === "dark" ? "Light" : "Dark"
    toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light theme" : "Switch to dark theme")
  }
}

function initTheme() {
  const theme = getPreferredTheme()
  applyTheme(theme)
  if (window.matchMedia) {
    try {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
        if (!localStorage.getItem(THEME_KEY)) {
          applyTheme(event.matches ? "dark" : "light")
        }
      })
    } catch (_) {
      // older browsers may not support addEventListener on matchMedia
    }
  }
}

function toggleTheme() {
  const next = activeTheme === "dark" ? "light" : "dark"
  localStorage.setItem(THEME_KEY, next)
  applyTheme(next)
}

function clearInputErrors(ids = []) {
  ids.forEach((fieldId) => {
    const input = el(fieldId)
    if (input) input.classList.remove("inputError")
  })
}

function validateRequiredFields(fields = [], messageTarget, messageText) {
  clearInputErrors(fields)
  let firstInvalid = null
  for (const fieldId of fields) {
    const input = el(fieldId)
    if (input && !String(input.value || "").trim()) {
      input.classList.add("inputError")
      firstInvalid = firstInvalid || input
    }
  }
  if (firstInvalid) {
    setFormMessage(messageTarget, messageText)
    firstInvalid.focus()
    return false
  }
  setFormMessage(messageTarget, "")
  return true
}

const cols = {
  users: ["user_id","first_name","last_name","email","password","created"],
  accounts: ["account_id","user_id","account_name","account_type","current_balance"],
  category: ["category_id","category_name","category_type"],
  transaction: ["transaction_id","user_id","account_id","category_id","transaction_date","amount","description"],
  budgets: ["budget_id","user_id","category_id","amount_limit","budget_month","budget_year"]
}

function money(n) {
  const x = Number(n || 0)
  return x.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function setStatus(msg, kind = "info") {
  const s = el("status")
  if (!s) return
  s.textContent = msg
  s.classList.remove("status--success", "status--error", "status--info")
  const map = {
    ok: "status--success",
    success: "status--success",
    bad: "status--error",
    error: "status--error",
    info: "status--info"
  }
  s.classList.add(map[kind] || "status--info")
}

async function api(path, opts = {}) {
  const res = await fetch(path, opts)
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = text }
  if (!res.ok) {
    const msg = (data && data.error) ? data.error : ("Request failed: " + res.status)
    throw new Error(msg)
  }
  return data
}

function rowToObj(table, row) {
  const keys = cols[table]
  if (!row || !keys) return null
  const obj = {}
  for (let i = 0; i < keys.length; i++) obj[keys[i]] = row[i]
  return obj
}

function categoryNameById(id) {
  const c = state.categories.find(x => String(x.category_id) === String(id))
  return c ? c.category_name : ("Category " + id)
}

function accountNameById(id) {
  const a = state.accounts.find(x => String(x.account_id) === String(id))
  return a ? a.account_name : ("Account " + id)
}

function setActiveView(view) {
  const viewIds = ["dashboard","accounts","transactions","budgets","categories"]
  for (const v of viewIds) {
    el("view" + v.charAt(0).toUpperCase() + v.slice(1)).classList.toggle("hidden", v !== view)
  }
  for (const btn of document.querySelectorAll(".appNav button[dataView]")) {
    const isActive = btn.getAttribute("dataView") === view
    btn.classList.toggle("primary", isActive)
    btn.classList.toggle("tabActive", isActive)
  }
  renderAll()
}

function showAuth(show) {
  const loggedIn = !show
  el("authCard").classList.toggle("hidden", !show)
  el("appCard").classList.toggle("hidden", show)
  const headerCta = el("headerCta")
  const refreshBtn = el("refreshBtn")
  const logoutBtn = el("logoutBtn")
  if (headerCta) headerCta.classList.toggle("hidden", loggedIn)
  if (refreshBtn) refreshBtn.classList.toggle("hidden", !loggedIn)
  if (logoutBtn) logoutBtn.classList.toggle("hidden", !loggedIn)
}

function resetEdits() {
  state.editingAccountId = null
  el("accountSubmit").textContent = "Create"
  el("accountCancel").classList.add("hidden")
  el("accountEditHint").textContent = ""
  el("accountForm").reset()
  el("accountBalance").value = "0"

  state.editingBudgetId = null
  el("budgetSubmit").textContent = "Create"
  el("budgetCancel").classList.add("hidden")
  el("budgetEditHint").textContent = ""
  el("budgetForm").reset()
}

async function loadCategories() {
  const rows = await api("/categories")
  state.categories = rows.map(r => rowToObj("category", r))
}

async function loadAccounts() {
  const rows = await api("/accounts/" + state.user.user_id)
  state.accounts = rows.map(r => rowToObj("accounts", r))
}

async function loadTransactions() {
  const rows = await api("/transactions/" + state.user.user_id)
  state.transactions = rows.map(r => rowToObj("transaction", r))
}

async function loadBudgets() {
  const u = state.user.user_id
  const m = state.budgetFilter.month
  const y = state.budgetFilter.year
  let path = "/budgets/" + u
  if (m && y) path += "?month=" + encodeURIComponent(m) + "&year=" + encodeURIComponent(y)
  const rows = await api(path)
  state.budgets = rows.map(r => rowToObj("budgets", r))
}

async function refreshAll(triggerBtn) {
  if (!state.user) return
  toggleButtonLoading(triggerBtn, true)
  setStatus("Loading data...", "info")
  try {
    await loadCategories()
    await loadAccounts()
    await loadTransactions()
    await loadBudgets()
    setStatus("Loaded. Ready.", "ok")
    renderAll()
  } catch (err) {
    setStatus(err.message || "Failed to load data", "bad")
  } finally {
    toggleButtonLoading(triggerBtn, false)
  }
}

function renderAll() {
  if (!state.user) return
  el("whoami").textContent = state.user.first_name + " " + state.user.last_name
  el("whoamiMeta").textContent = "User id " + state.user.user_id + "  " + state.user.email

  renderCategories()
  renderAccountSelects()
  renderBudgetSelects()
  renderAccounts()
  renderTransactions()
  renderBudgets()
  renderDashboard()
}

function renderCategories() {
  const tbody = el("catTable").querySelector("tbody")
  tbody.innerHTML = ""
  for (const c of state.categories) {
    const tr = document.createElement("tr")
    tr.innerHTML = "<td>" + c.category_name + "</td><td><span class='pill'>" + c.category_type + "</span></td><td>" + c.category_id + "</td>"
    tbody.appendChild(tr)
  }
}

function renderAccountSelects() {
  const sel = el("txAccount")
  sel.innerHTML = ""
  for (const a of state.accounts) {
    const opt = document.createElement("option")
    opt.value = a.account_id
    opt.textContent = a.account_name + "  (" + a.account_type + ")"
    sel.appendChild(opt)
  }

  const selCat = el("txCategory")
  selCat.innerHTML = ""
  for (const c of state.categories) {
    const opt = document.createElement("option")
    opt.value = c.category_id
    opt.textContent = c.category_name + "  (" + c.category_type + ")"
    selCat.appendChild(opt)
  }
}

function renderBudgetSelects() {
  const sel = el("budgetCategory")
  sel.innerHTML = ""
  for (const c of state.categories) {
    const opt = document.createElement("option")
    opt.value = c.category_id
    opt.textContent = c.category_name + "  (" + c.category_type + ")"
    sel.appendChild(opt)
  }
}

function renderAccounts() {
  const tbody = el("accountsTable").querySelector("tbody")
  tbody.innerHTML = ""
  for (const a of state.accounts) {
    const tr = document.createElement("tr")
    tr.innerHTML =
      "<td>" + a.account_name + "</td>" +
      "<td><span class='pill'>" + a.account_type + "</span></td>" +
      "<td class='right'>" + money(a.current_balance) + "</td>" +
      "<td></td>"
    const td = tr.querySelector("td:last-child")

    const editBtn = document.createElement("button")
    editBtn.type = "button"
    editBtn.className = "btn btnSecondary"
    editBtn.textContent = "Edit"
    editBtn.onclick = () => {
      state.editingAccountId = a.account_id
      el("accountName").value = a.account_name
      el("accountType").value = a.account_type
      el("accountBalance").value = Number(a.current_balance || 0)
      el("accountSubmit").textContent = "Update"
      el("accountCancel").classList.remove("hidden")
      el("accountEditHint").textContent = "Editing account id " + a.account_id
    }

    const delBtn = document.createElement("button")
    delBtn.type = "button"
    delBtn.className = "btn btnDanger"
    delBtn.textContent = "Delete"
    delBtn.onclick = async () => {
      const ok = confirm("Delete this account?")
      if (!ok) return
      try {
        await api("/accounts/" + a.account_id, { method: "DELETE" })
        await refreshAll()
      } catch (e) {
        setStatus(e.message, "bad")
      }
    }

    const actions = document.createElement("div")
    actions.className = "buttonGroup"
    actions.appendChild(editBtn)
    actions.appendChild(delBtn)
    td.appendChild(actions)
    tbody.appendChild(tr)
  }
}

function renderTransactions() {
  const tbody = el("txTable").querySelector("tbody")
  tbody.innerHTML = ""
  for (const t of state.transactions) {
    const tr = document.createElement("tr")
    const amt = Number(t.amount || 0)
    tr.innerHTML =
      "<td>" + String(t.transaction_date || "").slice(0, 10) + "</td>" +
      "<td>" + accountNameById(t.account_id) + "</td>" +
      "<td>" + categoryNameById(t.category_id) + "</td>" +
      "<td>" + (t.description || "") + "</td>" +
      "<td class='right'>" + money(amt) + "</td>" +
      "<td></td>"
    const td = tr.querySelector("td:last-child")

    const delBtn = document.createElement("button")
    delBtn.type = "button"
    delBtn.className = "btn btnDanger"
    delBtn.textContent = "Delete"
    delBtn.onclick = async () => {
      const ok = confirm("Delete this transaction?")
      if (!ok) return
      try {
        await api("/transactions/" + t.transaction_id, { method: "DELETE" })
        await refreshAll()
      } catch (e) {
        setStatus(e.message, "bad")
      }
    }

    const actions = document.createElement("div")
    actions.className = "buttonGroup"
    actions.appendChild(delBtn)
    td.appendChild(actions)
    tbody.appendChild(tr)
  }
}

function renderBudgets() {
  const tbody = el("budgetsTable").querySelector("tbody")
  tbody.innerHTML = ""
  for (const b of state.budgets) {
    const tr = document.createElement("tr")
    tr.innerHTML =
      "<td>" + categoryNameById(b.category_id) + "</td>" +
      "<td class='right'>" + money(b.amount_limit) + "</td>" +
      "<td>" + b.budget_month + "</td>" +
      "<td>" + b.budget_year + "</td>" +
      "<td></td>"
    const td = tr.querySelector("td:last-child")

    const editBtn = document.createElement("button")
    editBtn.type = "button"
    editBtn.className = "btn btnSecondary"
    editBtn.textContent = "Edit"
    editBtn.onclick = () => {
      state.editingBudgetId = b.budget_id
      el("budgetCategory").value = b.category_id
      el("budgetLimit").value = Number(b.amount_limit || 0)
      el("budgetMonth").value = b.budget_month
      el("budgetYear").value = b.budget_year
      el("budgetSubmit").textContent = "Update"
      el("budgetCancel").classList.remove("hidden")
      el("budgetEditHint").textContent = "Editing budget id " + b.budget_id
    }

    const delBtn = document.createElement("button")
    delBtn.type = "button"
    delBtn.className = "btn btnDanger"
    delBtn.textContent = "Delete"
    delBtn.onclick = async () => {
      const ok = confirm("Delete this budget?")
      if (!ok) return
      try {
        await api("/budgets/" + b.budget_id, { method: "DELETE" })
        await refreshAll()
      } catch (e) {
        setStatus(e.message, "bad")
      }
    }

    const actions = document.createElement("div")
    actions.className = "buttonGroup"
    actions.appendChild(editBtn)
    actions.appendChild(delBtn)
    td.appendChild(actions)
    tbody.appendChild(tr)
  }
}

function dashboardMonthYear() {
  const m = state.budgetFilter.month
  const y = state.budgetFilter.year
  if (m && y) return { month: Number(m), year: Number(y), label: "Month " + m + "  Year " + y }
  const now = new Date()
  return { month: now.getMonth() + 1, year: now.getFullYear(), label: "Current month " + (now.getMonth() + 1) + "  year " + now.getFullYear() }
}

function renderDashboard() {
  let income = 0
  let expense = 0
  for (const t of state.transactions) {
    const amt = Number(t.amount || 0)
    if (amt >= 0) income += amt
    else expense += Math.abs(amt)
  }
  el("dashIncome").textContent = money(income)
  el("dashExpense").textContent = money(expense)
  el("dashNet").textContent = money(income - expense)

  const spendByCat = new Map()
  for (const t of state.transactions) {
    const amt = Number(t.amount || 0)
    if (amt < 0) {
      const key = String(t.category_id)
      spendByCat.set(key, (spendByCat.get(key) || 0) + Math.abs(amt))
    }
  }
  const spendRows = Array.from(spendByCat.entries())
    .map(([catId, spent]) => ({ catId: Number(catId), spent }))
    .sort((a, b) => b.spent - a.spent)

  const spendTbody = el("dashSpendTable").querySelector("tbody")
  spendTbody.innerHTML = ""
  for (const r of spendRows) {
    const tr = document.createElement("tr")
    tr.innerHTML = "<td>" + categoryNameById(r.catId) + "</td><td class='right'>" + money(r.spent) + "</td>"
    spendTbody.appendChild(tr)
  }
  if (spendRows.length === 0) {
    const tr = document.createElement("tr")
    tr.innerHTML = "<td class='muted' colspan='2'>No expense transactions yet</td>"
    spendTbody.appendChild(tr)
  }

  const { month, year, label } = dashboardMonthYear()
  el("dashBudgetHint").textContent = label

  const actualByCatForMonth = new Map()
  for (const t of state.transactions) {
    const d = new Date(String(t.transaction_date).slice(0, 10))
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    const amt = Number(t.amount || 0)
    if (amt < 0 && m === month && y === year) {
      const key = String(t.category_id)
      actualByCatForMonth.set(key, (actualByCatForMonth.get(key) || 0) + Math.abs(amt))
    }
  }

  const budgetTbody = el("dashBudgetTable").querySelector("tbody")
  budgetTbody.innerHTML = ""
  const relevantBudgets = state.budgets.filter(b => Number(b.budget_month) === month && Number(b.budget_year) === year)
  for (const b of relevantBudgets) {
    const spent = actualByCatForMonth.get(String(b.category_id)) || 0
    const limit = Number(b.amount_limit || 0)
    const left = limit - spent
    const tr = document.createElement("tr")
    tr.innerHTML =
      "<td>" + categoryNameById(b.category_id) + "</td>" +
      "<td class='right'>" + money(limit) + "</td>" +
      "<td class='right'>" + money(spent) + "</td>" +
      "<td class='right'>" + money(left) + "</td>"
    budgetTbody.appendChild(tr)
  }
  if (relevantBudgets.length === 0) {
    const tr = document.createElement("tr")
    tr.innerHTML = "<td class='muted' colspan='4'>No budgets for this month and year</td>"
    budgetTbody.appendChild(tr)
  }
}

function wireTabs() {
  for (const btn of document.querySelectorAll(".appNav button[dataView]")) {
    btn.addEventListener("click", () => setActiveView(btn.getAttribute("dataView")))
  }
}

function wireAuthTabs() {
  el("tabLogin").onclick = () => {
    el("tabLogin").classList.add("primary")
    el("tabRegister").classList.remove("primary")
    el("loginForm").classList.remove("hidden")
    el("registerForm").classList.add("hidden")
  }
  el("tabRegister").onclick = () => {
    el("tabRegister").classList.add("primary")
    el("tabLogin").classList.remove("primary")
    el("registerForm").classList.remove("hidden")
    el("loginForm").classList.add("hidden")
  }
}

async function onLogin(e) {
  e.preventDefault()
  e.stopPropagation()
  const email = el("loginEmail").value.trim()
  const password = el("loginPassword").value
  if (!validateRequiredFields(["loginEmail", "loginPassword"], "loginError", "Email and password are required.")) {
    return
  }
  const submitBtn = e.submitter
  toggleButtonLoading(submitBtn, true)
  try {
    const res = await api(API_BASE + "/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
    const userRow = res.user
    if (!userRow) {
      setStatus("Login failed. Check email and password.", "bad")
      return
    }
    state.user = rowToObj("users", userRow)
    setFormMessage("loginError", "")
    showAuth(false)
    resetEdits()
    setStatus("Logged in. Loading data...", "info")
    await refreshAll()
    setActiveView("dashboard")
  } catch (err) {
    setStatus(err.message, "bad")
  } finally {
    toggleButtonLoading(submitBtn, false)
  }
}

async function onRegister(e) {
  e.preventDefault()
  e.stopPropagation()
  const first_name = el("regFirst").value.trim()
  const last_name = el("regLast").value.trim()
  const email = el("regEmail").value.trim()
  const password = el("regPassword").value
  if (!validateRequiredFields(["regFirst", "regLast", "regEmail", "regPassword"], "registerError", "All fields are required to create an account.")) {
    return
  }
  const submitBtn = e.submitter
  toggleButtonLoading(submitBtn, true)
  try {
    await api(API_BASE + "/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ first_name, last_name, email, password })
    })
    setStatus("User created. Now login.", "ok")
    el("tabLogin").click()
    el("loginEmail").value = email
    el("loginPassword").value = password
    setFormMessage("registerError", "")
  } catch (err) {
    setStatus(err.message, "bad")
  } finally {
    toggleButtonLoading(submitBtn, false)
  }
}

async function onAccountSubmit(e) {
  e.preventDefault()
  const submitBtn = e.submitter
  toggleButtonLoading(submitBtn, true)
  try {
    const payload = {
      user_id: state.user.user_id,
      account_name: el("accountName").value.trim(),
      account_type: el("accountType").value.trim(),
      current_balance: Number(el("accountBalance").value || 0)
    }
    if (state.editingAccountId) {
      await api("/accounts/" + state.editingAccountId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account_name: payload.account_name,
          account_type: payload.account_type,
          current_balance: payload.current_balance
        })
      })
    } else {
      await api("/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }
    resetEdits()
    await refreshAll()
    setActiveView("accounts")
  } catch (err) {
    setStatus(err.message, "bad")
  } finally {
    toggleButtonLoading(submitBtn, false)
  }
}

async function onTxSubmit(e) {
  e.preventDefault()
  const submitBtn = e.submitter
  toggleButtonLoading(submitBtn, true)
  try {
    const payload = {
      user_id: state.user.user_id,
      account_id: Number(el("txAccount").value),
      category_id: Number(el("txCategory").value),
      transaction_date: el("txDate").value,
      amount: Number(el("txAmount").value),
      description: el("txDesc").value.trim()
    }
    await api("/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
    el("transactionForm").reset()
    await refreshAll()
    setActiveView("transactions")
  } catch (err) {
    setStatus(err.message, "bad")
  } finally {
    toggleButtonLoading(submitBtn, false)
  }
}

async function onBudgetSubmit(e) {
  e.preventDefault()
  const submitBtn = e.submitter
  toggleButtonLoading(submitBtn, true)
  try {
    const payload = {
      user_id: state.user.user_id,
      category_id: Number(el("budgetCategory").value),
      amount_limit: Number(el("budgetLimit").value),
      budget_month: Number(el("budgetMonth").value),
      budget_year: Number(el("budgetYear").value)
    }
    if (state.editingBudgetId) {
      await api("/budgets/" + state.editingBudgetId, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category_id: payload.category_id,
          amount_limit: payload.amount_limit,
          budget_month: payload.budget_month,
          budget_year: payload.budget_year
        })
      })
    } else {
      await api("/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
    }
    resetEdits()
    await refreshAll()
    setActiveView("budgets")
  } catch (err) {
    setStatus(err.message, "bad")
  } finally {
    toggleButtonLoading(submitBtn, false)
  }
}

function wireActions() {
  const loginForm = el("loginForm")
  if (loginForm) loginForm.addEventListener("submit", onLogin)
  const registerForm = el("registerForm")
  if (registerForm) registerForm.addEventListener("submit", onRegister)

  el("refreshBtn").onclick = (e) => refreshAll(e.currentTarget).catch(err => setStatus(err.message, "bad"))
  el("logoutBtn").onclick = () => {
    state.user = null
    showAuth(true)
    setStatus("Not logged in", "info")
  }

  el("accountForm").addEventListener("submit", onAccountSubmit)
  el("accountCancel").onclick = () => resetEdits()

  el("transactionForm").addEventListener("submit", onTxSubmit)

  el("budgetForm").addEventListener("submit", onBudgetSubmit)
  el("budgetCancel").onclick = () => resetEdits()

  el("budgetApplyFilter").onclick = async () => {
    const m = el("budgetFilterMonth").value
    const y = el("budgetFilterYear").value
    state.budgetFilter.month = m ? Number(m) : null
    state.budgetFilter.year = y ? Number(y) : null
    await refreshAll()
  }

  el("budgetClearFilter").onclick = async () => {
    el("budgetFilterMonth").value = ""
    el("budgetFilterYear").value = ""
    state.budgetFilter.month = null
    state.budgetFilter.year = null
    await refreshAll()
  }

  const themeToggleBtn = el("themeToggle")
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      toggleTheme()
    }
  }
}

function setDefaults() {
  const today = new Date()
  const iso = today.toISOString().slice(0, 10)
  el("txDate").value = iso

  const m = today.getMonth() + 1
  const y = today.getFullYear()
  el("budgetMonth").value = m
  el("budgetYear").value = y
}

function warnIfWrongPort() {
  if (!IS_WRONG_PORT) return
  const currentPort = window.location.port || "(default)"
  setStatus(
    `You opened this page on port ${currentPort}. The backend runs on port 5000. ` +
      `Open http://127.0.0.1:5000 for full functionality.`,
    "bad"
  )
  const loginSubmit = document.querySelector("#loginForm button[type='submit']")
  if (loginSubmit) loginSubmit.disabled = true
  const registerSubmit = document.querySelector("#registerForm button[type='submit']")
  if (registerSubmit) registerSubmit.disabled = true
}

initTheme()
wireAuthTabs()
wireTabs()
wireActions()
setDefaults()
warnIfWrongPort()
