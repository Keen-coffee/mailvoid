// API Base URL
const API_BASE = '/api';
const STORAGE_KEY = 'mailvoid_token';

// DOM Elements - will be initialized in DOMContentLoaded
let loginModal;
let authCodeInput;
let loginBtn;
let loginError;
let mainContainer;
let logoutBtn;
let generateBtn;
let manualBtn;
let errorMessage;
let successMessage;
let generatedSection;
let tempEmailDisplay;
let copyBtn;
let newEmailBtn;
let expiryTimer;
let expiryProgress;
let manualModal;
let customEmailInput;
let createManualBtn;
let cancelManualBtn;
let closeManualModal;
let manualError;
let refreshActiveBtn;
let activeEmailsList;

// State
let currentTempEmail = null;
let currentExpiresAt = null;
let expiryInterval = null;
let authToken = localStorage.getItem(STORAGE_KEY);

function initializeDOMReferences() {
  // DOM Elements - Login
  loginModal = document.getElementById('loginModal');
  authCodeInput = document.getElementById('authCode');
  loginBtn = document.getElementById('loginBtn');
  loginError = document.getElementById('loginError');
  mainContainer = document.getElementById('mainContainer');
  logoutBtn = document.getElementById('logoutBtn');

  // DOM Elements - General
  generateBtn = document.getElementById('generateBtn');
  manualBtn = document.getElementById('manualBtn');
  errorMessage = document.getElementById('errorMessage');
  successMessage = document.getElementById('successMessage');
  generatedSection = document.getElementById('generatedSection');
  tempEmailDisplay = document.getElementById('tempEmailDisplay');
  copyBtn = document.getElementById('copyBtn');
  newEmailBtn = document.getElementById('newEmailBtn');
  expiryTimer = document.getElementById('expiryTimer');
  expiryProgress = document.getElementById('expiryProgress');

  // DOM Elements - Manual Email Modal
  manualModal = document.getElementById('manualModal');
  customEmailInput = document.getElementById('customEmail');
  createManualBtn = document.getElementById('createManualBtn');
  cancelManualBtn = document.getElementById('cancelManualBtn');
  closeManualModal = document.getElementById('closeManualModal');
  manualError = document.getElementById('manualError');

  // DOM Elements - Active Emails
  refreshActiveBtn = document.getElementById('refreshActiveBtn');
  activeEmailsList = document.getElementById('activeEmailsList');
}

// ==================== INITIALIZATION ====================

function initializeAuth() {
  if (authToken) {
    showMainApp();
  } else {
    loginModal.style.display = 'flex';
    mainContainer.style.display = 'none';
  }
}

// ==================== EVENT LISTENERS ====================

function attachEventListeners() {
  // Auth Events
  loginBtn.addEventListener('click', handleLogin);
  authCodeInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  logoutBtn.addEventListener('click', handleLogout);

  // Email Generation Events
  generateBtn.addEventListener('click', generateEmail);
  manualBtn.addEventListener('click', () => {
    clearManualError();
    manualModal.style.display = 'flex';
  });

  // Manual Email Modal Events
  closeManualModal.addEventListener('click', closeManualEmailModal);
  cancelManualBtn.addEventListener('click', closeManualEmailModal);
  manualModal.addEventListener('click', (e) => {
    if (e.target === manualModal) closeManualEmailModal();
  });
  createManualBtn.addEventListener('click', createManualEmail);
  customEmailInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') createManualEmail();
  });

  // Generated Email Events
  copyBtn.addEventListener('click', copyToClipboard);
  newEmailBtn.addEventListener('click', resetForm);

  // Active Emails Events
  refreshActiveBtn.addEventListener('click', loadActiveEmails);
}

// ==================== AUTHENTICATION ====================

async function handleLogin() {
  const code = authCodeInput.value.trim();

  loginBtn.disabled = true;
  loginError.classList.remove('show');

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });

    const data = await response.json();

    if (!response.ok) {
      showLoginError(data.error || 'Invalid code');
      loginBtn.disabled = false;
      return;
    }

    authToken = data.token;
    localStorage.setItem(STORAGE_KEY, authToken);
    showMainApp();
  } catch (error) {
    console.error('Login error:', error);
    showLoginError('Failed to login. Please try again.');
    loginBtn.disabled = false;
  }
}

async function handleLogout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
  } catch (error) {
    console.error('Logout error:', error);
  }

  authToken = null;
  localStorage.removeItem(STORAGE_KEY);

  authCodeInput.value = '';
  generatedSection.classList.add('hidden');
  if (expiryInterval) clearInterval(expiryInterval);

  loginModal.style.display = 'flex';
  mainContainer.style.display = 'none';
  loginError.classList.remove('show');
}

function showMainApp() {
  loginModal.style.display = 'none';
  mainContainer.style.display = 'flex';
  loadActiveEmails();
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.classList.add('show');
}

// ==================== EMAIL GENERATION ====================

async function generateEmail() {
  generateBtn.disabled = true;
  clearMessages();

  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({}),
    });

    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to generate email');
      generateBtn.disabled = false;
      return;
    }

    currentTempEmail = data.tempEmail;
    currentExpiresAt = data.expiresAt;

    displayGeneratedEmail(data.tempEmail, data.expiresIn);
    showSuccess('Temporary email generated successfully!');
    startExpiryTimer(data.expiresIn);
    loadActiveEmails();
  } catch (error) {
    console.error('Error generating email:', error);
    showError('Failed to generate email. Please try again.');
    generateBtn.disabled = false;
  }
}

async function createManualEmail() {
  const customEmail = customEmailInput.value.trim();

  if (!customEmail.includes('@')) {
    showManualError('Please enter a valid email address');
    return;
  }

  if (!customEmail.includes('@mailvoid.win')) {
    showManualError('Email must end with @mailvoid.win');
    return;
  }

  createManualBtn.disabled = true;
  clearManualError();

  try {
    const response = await fetch(`${API_BASE}/create-manual`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ customEmail }),
    });

    const data = await response.json();

    if (!response.ok) {
      showManualError(data.error || 'Failed to create email');
      createManualBtn.disabled = false;
      return;
    }

    currentTempEmail = data.tempEmail;
    currentExpiresAt = data.expiresAt;

    closeManualEmailModal();
    displayGeneratedEmail(data.tempEmail, data.expiresIn);
    showSuccess('Custom email created successfully!');
    startExpiryTimer(data.expiresIn);
    loadActiveEmails();
  } catch (error) {
    console.error('Error creating email:', error);
    showManualError('Failed to create email. Please try again.');
    createManualBtn.disabled = false;
  }
}

function closeManualEmailModal() {
  manualModal.style.display = 'none';
  customEmailInput.value = '';
  clearManualError();
}

function displayGeneratedEmail(tempEmail, expiresIn) {
  tempEmailDisplay.textContent = tempEmail;
  generatedSection.classList.remove('hidden');

  setTimeout(() => {
    generatedSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

function startExpiryTimer(expiresIn) {
  if (expiryInterval) clearInterval(expiryInterval);

  const endTime = Date.now() + expiresIn;

  expiryInterval = setInterval(() => {
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0) {
      clearInterval(expiryInterval);
      expiryTimer.textContent = 'Expired';
      expiryProgress.style.width = '0%';
      return;
    }

    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    expiryTimer.textContent = `${minutes}m ${seconds}s`;

    const percentage = ((expiresIn - remaining) / expiresIn) * 100;
    expiryProgress.style.width = percentage + '%';
  }, 100);
}

async function copyToClipboard() {
  if (!currentTempEmail) return;

  try {
    await navigator.clipboard.writeText(currentTempEmail);

    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓ Copied!';
    copyBtn.style.background = '#388e3c';
    copyBtn.style.color = 'white';

    setTimeout(() => {
      copyBtn.textContent = originalText;
      copyBtn.style.background = '';
      copyBtn.style.color = '';
    }, 2000);
  } catch (error) {
    console.error('Failed to copy:', error);
    showError('Failed to copy to clipboard');
  }
}

function resetForm() {
  generatedSection.classList.add('hidden');
  if (expiryInterval) clearInterval(expiryInterval);
  currentTempEmail = null;
  currentExpiresAt = null;
  generateBtn.disabled = false;
  clearMessages();
  loadActiveEmails();
}

// ==================== ACTIVE EMAILS ====================

async function loadActiveEmails() {
  try {
    const response = await fetch(`${API_BASE}/active-emails`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${authToken}` },
    });

    const data = await response.json();

    if (!response.ok) {
      activeEmailsList.innerHTML = '<div class="loading">Failed to load active emails</div>';
      return;
    }

    displayActiveEmails(data.tempEmails);
  } catch (error) {
    console.error('Error loading active emails:', error);
    activeEmailsList.innerHTML = '<div class="loading">Failed to load active emails</div>';
  }
}

function displayActiveEmails(emails) {
  if (!emails || emails.length === 0) {
    activeEmailsList.innerHTML = '<div class="loading">No active temporary emails. Generate one to get started!</div>';
    return;
  }

  const now = Date.now();
  const sortedEmails = emails.sort((a, b) => b.expiresAt - a.expiresAt);

  const html = sortedEmails.map(email => {
    const createdAt = new Date(email.createdAt);
    const expiresAt = new Date(email.expiresAt);
    const timeLeft = email.expiresAt - now;
    const isExpired = timeLeft <= 0;
    
    let timeDisplay = '';
    if (isExpired) {
      timeDisplay = 'Expired';
    } else {
      const minutes = Math.floor(timeLeft / 60000);
      const seconds = Math.floor((timeLeft % 60000) / 1000);
      timeDisplay = `${minutes}m ${seconds}s`;
    }

    const totalTime = 30 * 60 * 1000;
    const progressPercent = isExpired ? 0 : ((totalTime - timeLeft) / totalTime) * 100;

    return `
      <div class="active-email-item ${isExpired ? 'expired' : ''}">
        <div class="email-item-header">
          <div class="email-item-address">${escapeHtml(email.tempEmail)}</div>
          <button class="email-item-copy" onclick="copyEmail('${escapeHtml(email.tempEmail)}')">Copy</button>
        </div>
        <div class="email-item-info">
          <div class="email-item-time">
            <span class="email-item-time-label">Created:</span>
            <span>${createdAt.toLocaleTimeString()}</span>
          </div>
          <div class="email-item-time">
            <span class="email-item-time-label">Expires In:</span>
            <span>${timeDisplay}</span>
          </div>
        </div>
        <div class="email-item-expiry">
          <div class="email-item-expiry-bar" style="width: ${progressPercent}%"></div>
        </div>
      </div>
    `;
  }).join('');

  activeEmailsList.innerHTML = html;
}

async function copyEmail(email) {
  try {
    await navigator.clipboard.writeText(email);
    showSuccess('Email copied to clipboard!');
  } catch (error) {
    showError('Failed to copy email');
  }
}

// ==================== LOOKUP ====================

// ==================== UI HELPERS ====================

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  successMessage.classList.remove('show');
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('show');
  errorMessage.classList.remove('show');
}

function showManualError(message) {
  manualError.textContent = message;
  manualError.classList.add('show');
}

function clearManualError() {
  manualError.classList.remove('show');
  manualError.textContent = '';
}

function clearMessages() {
  errorMessage.classList.remove('show');
  successMessage.classList.remove('show');
  errorMessage.textContent = '';
  successMessage.textContent = '';
}

function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== INITIALIZATION ON LOAD ====================

window.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded');
  
  // First, initialize all DOM references
  initializeDOMReferences();
  console.log('DOM references initialized');
  
  // Then attach event listeners
  attachEventListeners();
  console.log('Event listeners attached');
  
  // Then initialize auth
  initializeAuth();
  console.log('Auth initialized');

  // Auto-refresh active emails every 10 seconds
  setInterval(() => {
    if (authToken) {
      loadActiveEmails();
    }
  }, 10000);
});

// Check if token is still valid when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden && authToken) {
    loadActiveEmails();
  }
});
