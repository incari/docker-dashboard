const API_BASE = '';
const ICONS = {
  cube: 'fa-cube', server: 'fa-server', database: 'fa-database', cloud: 'fa-cloud',
  code: 'fa-code', film: 'fa-film', download: 'fa-download', home: 'fa-home',
  shield: 'fa-shield-halved', chart: 'fa-chart-line'
};

let shortcuts = [];
let containers = [];

// Fetch data on load
document.addEventListener('DOMContentLoaded', () => {
  loadShortcuts();
  loadContainers();
  document.getElementById('shortcut-form').addEventListener('submit', saveShortcut);
});

async function loadShortcuts() {
  try {
    const res = await fetch(`${API_BASE}/api/shortcuts`);
    shortcuts = await res.json();
    renderShortcuts();
  } catch (e) { console.error('Failed to load shortcuts:', e); }
}

async function loadContainers() {
  try {
    const res = await fetch(`${API_BASE}/api/containers`);
    containers = await res.json();
    renderContainers();
  } catch (e) { console.error('Failed to load containers:', e); }
}

function renderShortcuts() {
  const grid = document.getElementById('shortcuts-grid');
  const noShortcuts = document.getElementById('no-shortcuts');
  
  if (shortcuts.length === 0) {
    grid.innerHTML = '';
    noShortcuts.classList.remove('hidden');
    return;
  }
  noShortcuts.classList.add('hidden');
  
  grid.innerHTML = shortcuts.map(s => `
    <div class="bg-gray-800 rounded-xl p-4 border border-gray-700 hover:border-blue-500 transition-all group">
      <div class="flex items-start justify-between mb-3">
        <div class="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center text-blue-400 text-xl">
          <i class="fas ${ICONS[s.icon] || 'fa-cube'}"></i>
        </div>
        <div class="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button onclick="editShortcut(${s.id})" class="p-2 hover:bg-gray-700 rounded"><i class="fas fa-edit text-sm"></i></button>
          <button onclick="deleteShortcut(${s.id})" class="p-2 hover:bg-red-600/20 rounded text-red-400"><i class="fas fa-trash text-sm"></i></button>
        </div>
      </div>
      <h3 class="font-semibold text-lg">${escapeHtml(s.name)}</h3>
      <p class="text-gray-400 text-sm truncate">${escapeHtml(s.description || '')}</p>
      <a href="http://${location.hostname}:${s.port}" target="_blank" 
         class="mt-3 inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
        <i class="fas fa-external-link-alt"></i> Port ${s.port}
      </a>
    </div>
  `).join('');
}

function renderContainers() {
  const grid = document.getElementById('containers-grid');
  grid.innerHTML = containers.map(c => {
    const isRunning = c.state === 'running';
    const ports = c.ports.map(p => p.public).filter(Boolean);
    return `
      <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div class="flex items-center gap-3 mb-2">
          <span class="w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-500'}"></span>
          <span class="font-medium truncate">${escapeHtml(c.name)}</span>
        </div>
        <p class="text-gray-500 text-xs truncate mb-2">${escapeHtml(c.image)}</p>
        <div class="flex flex-wrap gap-1">
          ${ports.map(p => `
            <button onclick="quickAdd('${escapeHtml(c.name)}', ${p})" 
                    class="text-xs bg-gray-700 hover:bg-blue-600 px-2 py-1 rounded">:${p}</button>
          `).join('') || '<span class="text-gray-600 text-xs">No ports</span>'}
        </div>
      </div>
    `;
  }).join('');
}

function openModal(data = null) {
  document.getElementById('modal').classList.add('active');
  document.getElementById('modal-title').textContent = data ? 'Edit Shortcut' : 'Add Shortcut';
  document.getElementById('shortcut-id').value = data?.id || '';
  document.getElementById('shortcut-name').value = data?.name || '';
  document.getElementById('shortcut-desc').value = data?.description || '';
  document.getElementById('shortcut-icon').value = data?.icon || 'cube';
  document.getElementById('shortcut-port').value = data?.port || '';
}

function closeModal() { document.getElementById('modal').classList.remove('active'); }

function quickAdd(name, port) { openModal({ name, port, icon: 'cube' }); }

function editShortcut(id) {
  const s = shortcuts.find(x => x.id === id);
  if (s) openModal(s);
}

async function deleteShortcut(id) {
  if (!confirm('Delete this shortcut?')) return;
  await fetch(`${API_BASE}/api/shortcuts/${id}`, { method: 'DELETE' });
  loadShortcuts();
}

async function saveShortcut(e) {
  e.preventDefault();
  const id = document.getElementById('shortcut-id').value;
  const data = {
    name: document.getElementById('shortcut-name').value,
    description: document.getElementById('shortcut-desc').value,
    icon: document.getElementById('shortcut-icon').value,
    port: parseInt(document.getElementById('shortcut-port').value)
  };
  
  const method = id ? 'PUT' : 'POST';
  const url = id ? `${API_BASE}/api/shortcuts/${id}` : `${API_BASE}/api/shortcuts`;
  
  await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  closeModal();
  loadShortcuts();
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

