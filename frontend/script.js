const API_BASE = '/api';
const socket = typeof io !== 'undefined' ? io() : null;

let items = [];
let editingId = null;
let categoryChart = null;
let topValueChart = null;

const itemForm = document.getElementById('itemForm');
const itemsBody = document.getElementById('itemsBody');
const searchInput = document.getElementById('search');
const alertsDiv = document.getElementById('alerts');
const editId = document.getElementById('editId');
const cancelBtn = document.getElementById('cancelEdit');
const totalItemsEl = document.getElementById('totalItems');
const totalValueEl = document.getElementById('totalValue');
const lowStockEl = document.getElementById('lowStock');
const categoryCountEl = document.getElementById('categoryCount');
const categoryFilter = document.getElementById('categoryFilter');
const sortSelect = document.getElementById('sortSelect');
const exportBtn = document.getElementById('exportBtn');
const categoryInput = document.getElementById('itemCategory');
const locationInput = document.getElementById('itemLocation');
const descriptionInput = document.getElementById('itemDescription');

function showStatus(message, isError = false) {
  alertsDiv.innerHTML = `<i class="fas ${isError ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i> ${message}`;
  alertsDiv.classList.toggle('alert-active', isError);
}

function showEmptyState(message) {
  itemsBody.innerHTML = `\n    <tr>\n      <td colspan="8" class="empty-state">${message}</td>\n    </tr>\n  `;
}

function getSearchParams() {
  const search = searchInput.value.trim();
  const category = categoryFilter.value;
  const sort = sortSelect.value;
  return { search, category, sort };
}

async function loadCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    const categories = await res.json();
    const unique = ['All', ...categories.filter((c) => c && c.trim())];
    categoryFilter.innerHTML = unique.map((category) => `
      <option value="${category}">${category}</option>
    `).join('');
    categoryInput.innerHTML = [`
      <option value="General">General</option>
      ${categories.map((category) => `<option value="${category}">${category}</option>`).join('')}
    `].join('');
  } catch (err) {
    console.error('Category load error:', err);
    showStatus('Unable to load categories. Make sure the backend server is running at http://localhost:3000', true);
    showEmptyState('Unable to load inventory categories.');
  }
}

async function loadItems() {
  try {
    const { search, category, sort } = getSearchParams();
    const query = new URLSearchParams({ search, category, sort });
    const res = await fetch(`${API_BASE}/items?${query.toString()}`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    items = await res.json();
    if (!items.length) {
      showEmptyState('No inventory items available.');
    } else {
      renderItems();
    }
    await loadSummary();
    await loadAnalytics();
    updateAlerts();
    showStatus('Inventory loaded successfully.');
  } catch (err) {
    console.error('Load error:', err);
    showStatus('Unable to load inventory. Open this page from http://localhost:3000 and ensure the server is running.', true);
    showEmptyState('Failed to display items.');
  }
}

async function loadSummary() {
  try {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    totalItemsEl.textContent = data.totalItems;
    totalValueEl.textContent = `$${Number(data.totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    lowStockEl.textContent = data.lowStock;
    categoryCountEl.textContent = data.categories.length;
  } catch (err) {
    console.error('Summary error:', err);
  }
}

async function updateAlerts() {
  try {
    const res = await fetch(`${API_BASE}/alerts?threshold=10`);
    const alerts = await res.json();
    if (alerts.length > 0) {
      alertsDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        ${alerts.length} low stock item${alerts.length > 1 ? 's' : ''}:
        ${alerts.map(a => `<strong>${a.name}</strong> (${a.quantity})`).join(', ')}
      `;
      alertsDiv.classList.add('alert-active');
    } else {
      alertsDiv.innerHTML = '<i class="fas fa-check-circle"></i> All items are healthy ✓';
      alertsDiv.classList.remove('alert-active');
    }
  } catch (err) {
    console.error('Alerts error:', err);
  }
}

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function renderItems() {
  itemsBody.innerHTML = items.map((item) => {
    const value = item.quantity * item.price;
    return `
      <tr class="${item.quantity < 10 ? 'low-stock' : ''}">
        <td>${item.id}</td>
        <td>
          <div class="item-name">${item.name}</div>
          <div class="item-meta">${item.description || '<em>No description</em>'}</div>
        </td>
        <td><span class="badge category-badge">${item.category}</span></td>
        <td><span class="${item.quantity < 10 ? 'low-qty' : ''}">${item.quantity}</span></td>
        <td>${formatCurrency(item.price)}</td>
        <td>${formatCurrency(value)}</td>
        <td>${item.location || 'Warehouse'}</td>
        <td class="actions-cell">
          <button class="btn-small" onclick="adjustStock(${item.id}, 1)" title="Increase quantity"><i class="fas fa-plus"></i></button>
          <button class="btn-small" onclick="adjustStock(${item.id}, -1)" title="Decrease quantity"><i class="fas fa-minus"></i></button>
          <button class="btn-success edit-btn" onclick="editItem(${item.id})" title="Edit"><i class="fas fa-edit"></i></button>
          <button class="btn-danger delete-btn" onclick="deleteItem(${item.id})" title="Delete"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `;
  }).join('');
}

function editItem(id) {
  const item = items.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemQty').value = item.quantity;
  document.getElementById('itemPrice').value = item.price;
  categoryInput.value = item.category || 'General';
  locationInput.value = item.location || '';
  descriptionInput.value = item.description || '';
  editId.value = id;
  const submitButton = itemForm.querySelector('button[type="submit"]');
  submitButton.innerHTML = '<i class="fas fa-save"></i> Update';
  itemForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
  document.getElementById('itemName').focus();
}

async function adjustStock(id, adjustment) {
  try {
    await fetch(`${API_BASE}/items/${id}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment })
    });
    loadItems();
  } catch (err) {
    console.error('Stock update error:', err);
  }
}

async function deleteItem(id) {
  if (!confirm('Delete this item?')) return;
  try {
    await fetch(`${API_BASE}/items/${id}`, { method: 'DELETE' });
    loadItems();
  } catch (err) {
    console.error('Delete error:', err);
  }
}

itemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const qty = parseInt(document.getElementById('itemQty').value, 10);
  const price = parseFloat(document.getElementById('itemPrice').value);
  const category = categoryInput.value;
  const location = locationInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!name || isNaN(qty) || isNaN(price)) {
    return alert('Please fill in a valid name, quantity, and price.');
  }

  const payload = { name, quantity: qty, price, category, location, description };

  try {
    if (editingId) {
      await fetch(`${API_BASE}/items/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(`${API_BASE}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    resetForm();
    loadItems();
  } catch (err) {
    alert('Error saving item: ' + err.message);
  }
});

async function loadAnalytics() {
  try {
    const res = await fetch(`${API_BASE}/analytics`);
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    const data = await res.json();
    renderAnalytics(data);
  } catch (err) {
    console.error('Analytics error:', err);
  }
}

function appendChatMessage(role, text) {
  const chatLog = document.getElementById('chatLog');
  const wrapper = document.createElement('div');
  wrapper.className = `${role === 'user' ? 'user-message' : 'bot-message'} chat-message`;
  wrapper.innerHTML = `<span class="chat-bubble">${text}</span>`;
  chatLog.appendChild(wrapper);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function parseChatCommand(message) {
  const text = message.trim().toLowerCase();
  if (!text) return 'Please type a command so I can help you.';

  if (text.includes('restock') || text.includes('low stock') || text.includes('needs restocking')) {
    const lowItems = items.filter((item) => item.quantity < 10);
    if (!lowItems.length) return 'All stock levels are healthy right now.';
    return `Low stock items: ${lowItems.map((item) => `${item.name} (${item.quantity})`).join(', ')}.`;
  }

  if (text.includes('inventory value') || text.includes('total value') || text.includes('value of inventory')) {
    const total = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
    return `Current inventory value is $${total.toFixed(2)}.`;
  }

  if (text.startsWith('show ') || text.startsWith('list ')) {
    const category = text.replace(/^(show|list)\s+/, '').replace(/\s+items?$/, '');
    const match = items.filter((item) => item.category.toLowerCase() === category.toLowerCase());
    if (match.length) {
      return `Items in ${category}: ${match.map((item) => `${item.name} (${item.quantity})`).join(', ')}.`;
    }
  }

  if (text.startsWith('edit item')) {
    const id = parseInt(text.replace(/[^0-9]/g, ''), 10);
    if (Number.isInteger(id) && id > 0) {
      const item = items.find((i) => i.id === id);
      if (item) {
        editItem(id);
        return `Editing item #${id}: ${item.name}. The form is ready for updates.`;
      }
      return `I couldn't find item #${id}.`;
    }
    return 'Specify the item number to edit, for example: edit item 4.';
  }

  if (text.startsWith('add item')) {
    const nameMatch = message.match(/add item\s+(.+?)\s+qty/i);
    const qtyMatch = message.match(/qty\s+(\d+)/i);
    const priceMatch = message.match(/price\s+(\d+(?:\.\d+)?)/i);
    const categoryMatch = message.match(/category\s+([a-zA-Z ]+)/i);
    if (nameMatch && qtyMatch && priceMatch) {
      document.getElementById('itemName').value = nameMatch[1].trim();
      document.getElementById('itemQty').value = parseInt(qtyMatch[1], 10);
      document.getElementById('itemPrice').value = parseFloat(priceMatch[1]);
      if (categoryMatch) categoryInput.value = categoryMatch[1].trim();
      document.getElementById('itemLocation').focus();
      itemForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return 'I populated the form for a new item. Please review and submit it.';
    }
    return 'To add an item say: add item Laptop qty 5 price 499.99 category Electronics.';
  }

  return 'I can help with stock checks, inventory value, category queries, or editing an item. Try “what needs restocking?”, “show Electronics”, or “edit item 4”.';
}

async function handleChatSubmit(event) {
  event.preventDefault();
  const input = document.getElementById('chatInput');
  const message = input.value.trim();
  if (!message) return;
  appendChatMessage('user', message);
  const reply = parseChatCommand(message);
  appendChatMessage('bot', reply);
  input.value = '';
}

const chatForm = document.getElementById('chatForm');
if (chatForm) {
  chatForm.addEventListener('submit', handleChatSubmit);
}

function renderAnalytics(data) {
  const categoryLabels = data.categoryValues.map((row) => row.category);
  const categoryValues = data.categoryValues.map((row) => row.value);
  const categoryColors = ['#6c63ff', '#4f8ef7', '#22c997', '#ff7a67', '#fa8bff', '#ffd166'];

  if (categoryChart) categoryChart.destroy();
  const ctxCategory = document.getElementById('categoryChart').getContext('2d');
  categoryChart = new Chart(ctxCategory, {
    type: 'doughnut',
    data: {
      labels: categoryLabels,
      datasets: [{
        data: categoryValues,
        backgroundColor: categoryColors.slice(0, categoryLabels.length),
        borderWidth: 0
      }]
    },
    options: {
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, padding: 16 } },
        tooltip: { callbacks: { label: (context) => `${context.label}: $${Number(context.raw).toLocaleString()}` } }
      },
      cutout: '65%'
    }
  });

  const topLabels = data.topItems.map((item) => item.name);
  const topValues = data.topItems.map((item) => item.value);

  if (topValueChart) topValueChart.destroy();
  const ctxTop = document.getElementById('topValueChart').getContext('2d');
  topValueChart = new Chart(ctxTop, {
    type: 'bar',
    data: {
      labels: topLabels,
      datasets: [{
        label: 'Inventory Value',
        data: topValues,
        backgroundColor: '#6c63ff',
        borderRadius: 12,
        maxBarThickness: 42
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (context) => `Value: $${Number(context.raw).toLocaleString()}` } }
      },
      scales: {
        x: { ticks: { color: '#4f5d7a' } },
        y: { ticks: { color: '#4f5d7a', callback: (value) => `$${value}` } }
      }
    }
  });
}

function resetForm() {
  itemForm.reset();
  editId.value = '';
  editingId = null;
  itemForm.querySelector('button[type="submit"]').innerHTML = '<i class="fas fa-plus"></i> Add Item';
}

cancelBtn.addEventListener('click', () => {
  resetForm();
});

function exportCSV() {
  if (!items.length) return;
  const header = ['ID', 'Name', 'Category', 'Quantity', 'Price', 'Value', 'Location', 'Description'];
  const rows = items.map((item) => [
    item.id,
    `"${item.name.replace(/"/g, '""')}"`,
    item.category,
    item.quantity,
    item.price.toFixed(2),
    (item.quantity * item.price).toFixed(2),
    `"${(item.location || '').replace(/"/g, '""')}"`,
    `"${(item.description || '').replace(/"/g, '""')}"`
  ]);
  const csvContent = [header.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'inventory_export.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

searchInput.addEventListener('input', () => {
  loadItems();
});
categoryFilter.addEventListener('change', loadItems);
sortSelect.addEventListener('change', loadItems);
exportBtn.addEventListener('click', exportCSV);

if (socket) {
  socket.on('itemUpdate', () => {
    loadItems();
  });
} else {
  showStatus('Socket.io not loaded. Open the page from http://localhost:3000 to enable real-time updates.', true);
}

setInterval(updateAlerts, 10000);
showStatus('Loading inventory...');
showEmptyState('Loading inventory...');

loadCategories().then(async () => {
  await loadItems();
}).catch((err) => {
  console.error('Startup error:', err);
  showStatus('Unable to initialize inventory dashboard. Make sure the backend server is running.', true);
  showEmptyState('Startup failed.');
});

