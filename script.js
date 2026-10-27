const STORAGE_KEY = "ajorbit-expense-tracker-v1";
const $ = (id) => document.getElementById(id);
const today = new Date();
const dateString = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
$("date").value = dateString;
$("todayLabel").textContent = today.toLocaleDateString(undefined,{day:"2-digit",month:"short",year:"numeric"}).toUpperCase();
$("yearLabel").textContent = today.getFullYear();

let transactions = loadTransactions();
let currentType = "expense";

function loadTransactions() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter(isValidTransaction) : [];
  } catch {
    return [];
  }
}
function isValidTransaction(item) {
  return item && typeof item.id === "string" &&
    (item.type === "income" || item.type === "expense") &&
    typeof item.description === "string" &&
    Number.isFinite(Number(item.amount)) && Number(item.amount) > 0 &&
    typeof item.date === "string";
}
function saveTransactions() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    return true;
  } catch {
    showMessage("Could not save. Check browser storage settings.", true);
    return false;
  }
}
function money(value) {
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(value);
}
function safeText(value) {
  return String(value).replace(/[&<>"']/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[char]));
}
function showMessage(message, error=false) {
  $("formMessage").textContent = message;
  $("formMessage").style.color = error ? "#ff7182" : "var(--green)";
}
function setType(type) {
  currentType = type;
  $("transactionType").value = type;
  document.querySelectorAll(".type-button").forEach(button => {
    const active = button.dataset.type === type;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  $("submitLabel").textContent = type === "expense" ? "＋ ADD EXPENSE" : "＋ ADD MONEY RECEIVED";
  const category = $("category");
  if (type === "income" && ["Food","Travel","Study","Entertainment","Shopping","Health","Other"].includes(category.value)) category.value = "Pocket Money";
  if (type === "expense" && ["Pocket Money","Gift","Freelance"].includes(category.value)) category.value = "Food";
}
document.querySelectorAll(".type-button").forEach(button => button.addEventListener("click", () => setType(button.dataset.type)));

$("transactionForm").addEventListener("submit", event => {
  event.preventDefault();
  const description = $("description").value.trim();
  const amount = Number($("amount").value);
  const date = $("date").value;
  if (!description) return showMessage("Please enter a description.", true);
  if (!Number.isFinite(amount) || amount <= 0 || amount > 10000000) return showMessage("Enter an amount above ₹0 and below ₹1 crore.", true);
  if (!date || date > dateString) return showMessage("Choose a valid date that is not in the future.", true);
  const item = {
    id: (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`),
    type: currentType, description, amount: Math.round(amount * 100) / 100,
    category: $("category").value, date, note: $("note").value.trim()
  };
  transactions.push(item);
  if (!saveTransactions()) { transactions.pop(); return; }
  $("description").value = "";
  $("amount").value = "";
  $("note").value = "";
  showMessage(currentType === "expense" ? "Expense recorded successfully." : "Money received recorded successfully.");
  render();
});

$("goalInput").addEventListener("input", renderSummary);
$("searchInput").addEventListener("input", renderTransactions);
$("filterType").addEventListener("change", renderTransactions);

function totals() {
  const income = transactions.filter(t=>t.type==="income").reduce((sum,t)=>sum+t.amount,0);
  const expenses = transactions.filter(t=>t.type==="expense").reduce((sum,t)=>sum+t.amount,0);
  return {income,expenses,balance:income-expenses,rate:income>0?Math.max(0,Math.min(100,((income-expenses)/income)*100)):0};
}
function renderSummary() {
  const t = totals();
  $("balanceValue").textContent = money(t.balance);
  $("incomeValue").textContent = money(t.income);
  $("expenseValue").textContent = money(t.expenses);
  $("savingsRate").textContent = `${Math.round(t.rate)}%`;
  const goal = Math.max(1,Number($("goalInput").value)||10000);
  const saved = Math.max(0,t.balance);
  const percent = Math.min(100,(saved/goal)*100);
  $("goalProgress").style.width = `${percent}%`;
  $("goalPercent").textContent = `${Math.floor(percent)}% saved`;
  $("goalRemaining").textContent = saved >= goal ? "Target reached!" : `${money(goal-saved)} to go`;
  renderBreakdown();
}
function formatDate(value) {
  const d = new Date(`${value}T12:00:00`);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
}
function renderTransactions() {
  const search = $("searchInput").value.trim().toLowerCase();
  const type = $("filterType").value;
  const filtered = [...transactions].filter(t =>
    (type==="all" || t.type===type) &&
    `${t.description} ${t.category} ${t.note||""}`.toLowerCase().includes(search)
  ).sort((a,b)=>b.date.localeCompare(a.date));
  $("transactionCount").textContent = `${transactions.length} RECORD${transactions.length===1?"":"S"}`;
  if (!filtered.length) {
    $("transactionList").innerHTML = `<div class="empty-state"><span>⌁</span><strong>${transactions.length?"No matches found":"No transactions yet"}</strong><p>${transactions.length?"Try a different search or filter.":"Add your first entry to start tracking."}</p></div>`;
    return;
  }
  $("transactionList").innerHTML = filtered.map(t => `
    <article class="transaction ${t.type}">
      <div class="transaction-icon">${t.type==="income"?"↙":"↗"}</div>
      <div class="transaction-info"><strong>${safeText(t.description)}</strong><small>${safeText(t.category)} · ${formatDate(t.date)}${t.note?` · ${safeText(t.note)}`:""}</small></div>
      <div class="transaction-amount">${t.type==="income"?"+":"−"}${money(t.amount)}</div>
      <button type="button" class="delete-button" data-delete="${safeText(t.id)}" aria-label="Delete ${safeText(t.description)}" title="Delete transaction">×</button>
    </article>`).join("");
  $("transactionList").querySelectorAll("[data-delete]").forEach(button => button.addEventListener("click",()=>{
    const id=button.dataset.delete;
    const item=transactions.find(t=>t.id===id);
    if(!item || !confirm(`Delete "${item.description}"?`)) return;
    const previous=transactions;
    transactions=transactions.filter(t=>t.id!==id);
    if(!saveTransactions()) transactions=previous;
    render();
  }));
}
function renderBreakdown() {
  const expenses=transactions.filter(t=>t.type==="expense");
  const byCategory={};
  expenses.forEach(t=>byCategory[t.category]=(byCategory[t.category]||0)+t.amount);
  const entries=Object.entries(byCategory).sort((a,b)=>b[1]-a[1]);
  if(!entries.length){$("categoryBreakdown").innerHTML='<p class="muted">Add expenses to see your category breakdown.</p>';return;}
  const max=entries[0][1];
  $("categoryBreakdown").innerHTML=entries.map(([name,amount])=>`
    <div class="breakdown-row"><span class="breakdown-name">${safeText(name)}</span><div class="bar-track"><div class="bar-fill" style="width:${(amount/max)*100}%"></div></div><span class="breakdown-amount">${money(amount)}</span></div>
  `).join("");
}
$("exportButton").addEventListener("click",()=>{
  if(!transactions.length){showMessage("There are no transactions to export.",true);return;}
  const headers=["Date","Type","Description","Category","Amount_INR","Note"];
  const rows=transactions.map(t=>[t.date,t.type,t.description,t.category,t.amount,t.note||""]);
  const csv=[headers,...rows].map(row=>row.map(value=>`"${String(value).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;link.download="aj-orbit-transactions.csv";link.click();
  URL.revokeObjectURL(url);
  showMessage("CSV export created.");
});
$("clearButton").addEventListener("click",()=>{
  if(!transactions.length){showMessage("There are no transactions to clear.",true);return;}
  if(!confirm("Delete every transaction stored in this browser? This cannot be undone unless you exported a backup.")) return;
  const previous=transactions;transactions=[];
  if(!saveTransactions()){transactions=previous;return;}
  render();showMessage("All transactions cleared.");
});
function render(){renderSummary();renderTransactions();}
render();
