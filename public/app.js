// API Base URL
const API_BASE = '/api';
const STORAGE_KEY = 'mailvoid_token';

// DOM Elements - Login
const loginModal = document.getElementById('loginModal');
const authCodeInput = document.getElementById('authCode');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');
const mainContainer = document.getElementById('mainContainer');
const logoutBtn = document.getElementById('logoutBtn');

// DOM Elements - General
const personalEmailInput = document.getElementById('personalEmail');
const generateBtn = document.getElementById('generateBtn');
const manualBtn = document.getElementById('manualBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const generatedSection = document.getElementById('generatedSection');
const tempEmailDisplay = document.getElementById('tempEmailDisplay');
const copyBtn = document.getElementById('copyBtn');
const newEmailBtn = document.getElementById('newEmailBtn');
const expiryTimer = document.getElementById('expiryTimer');
const expiryProgress = document.getElementById('expiryProgress');

// DOM Elements - Manual Email Modal
const manualModal = document.getElementById('manualModal');
const customEmailInput = document.getElementById('customEmail');
const createManualBtn = document.getElementById('createManualBtn');
const cancelManualBtn = document.getElementById('cancelManualBtn');
const closeManualModal = document.getElementById('closeManualModal');
const manualError = document.getElementById('manualError');

// DOM Elements - Active Emails
const refreshActiveBtn = document.getElementById('refreshActiveBtn');
const activeEmailsList = document.getElementById('activeEmailsList');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Lookup elements
const lookupPersonalInput = document.getElementById('lookupPersonal');
const lookupPersonalBtn = document.getElementById('lookupPersonalBtn');
const personalLookupResults = document.getElementById('personalLookupResults');

const lookupTempInput = document.getElementById('lookupTemp');
const lookupTempBtn = document.getElementById('lookupTempBtn');
const tempLookupResults = document.getElementById('tempLookupResults');

// State
let currentTempEmail = null;
let currentExpiresAt = null;
let expiryInterval = null;
let authToken = localStorage.getItem(STORAGE_KEY);

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

// Auth Events
loginBtn.addEventListener('click', handleLogin);
authCodeInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') handleLogin();
});
logoutBtn.addEventListener('click', handleLogout);

// Email Generation Events
personalEmailInput.addEventListener('input', validateEmail);
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

// Tab Switching Events
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    switchTab(tabName);
  });
});

// Lookup Events
lookupPersonalBtn.addEventListener('click', lookupByPersonalEmail);
lookupTempBtn.addEventListener('click', lookupByTempEmail);

lookupPersonalInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') lookupByPersonalEmail();
});

lookupTempInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') lookupByTempEmail();
});

// ==================== AUTHENTICATION ====================

async function handleLogin() {
  const code = authCodeInput.value.trim();

  if (code.length !== 8) {
    showLoginError('Please enter an 8-digit code');
    return;
  }

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
  personalEmailInput.value = '';
  generatedSection.classList.add('hidden');
  if (expiryInterval) clearInterval(expiryInterval);

  loginModal.style.display = 'flex';
  mainContainer.style.display = 'none';
  loginError.classList.remove('show');
}

function showMainApp() {
  loginModal.style.display = 'none';
  mainContainer.style.display = 'flex';
  validateEmail();
  loadActiveEmails();
}

function showLoginError(message) {
  loginError.textContent = message;
  loginError.classList.add('show');
}

// ==================== EMAIL GENERATION ====================

function validateEmail() {
  const email = personalEmailInput.value.trim();
  const isValid = email.length > 0 && email.includes('@');
  generateBtn.disabled = !isValid;
  manualBtn.disabled = !isValid;

  if (isValid) {
    clearMessages();
  }
}

async function generateEmail() {
  const personalEmail = personalEmailInput.value.trim();

  if (!personalEmail.includes('@')) {
    showError('Please enter a valid email address');
    return;
  }

  generateBtn.disabled = true;
  clearMessages();

  try {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ personalEmail }),
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
  const personalEmail = personalEmailInput.value.trim();
  const customEmail = customEmailInput.value.trim();

  if (!personalEmail.includes('@')) {
    showManualError('Please enter a valid personal email');
    return;
  }

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
      body: JSON.stringify({ personalEmail, customEmail }),
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

async function lookupByPersonalEmail() {
  const email = lookupPersonalInput.value.trim();

  if (!email.includes('@')) {
    showError('Please enter a valid email address');
    return;
  }

  personalLookupResults.innerHTML = '<div style="text-align: center; color: #999;">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/lookup/personal?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (!response.ok) {
      showError(data.error || 'Failed to lookup emails');
      personalLookupResults.innerHTML = '';
      return;
    }

    displayLookupResults(data.tempEmails, personalLookupResults);
  } catch (error) {
    console.error('Error looking up emails:', error);
    showError('Failed to lookup emails');
    personalLookupResults.innerHTML = '';
  }
}

async function lookupByTempEmail() {
  const email = lookupTempInput.value.trim();

  if (!email.includes('@')) {
    showError('Please enter a valid email address');
    return;
  }

  tempLookupResults.innerHTML = '<div style="text-align: center; color: #999;">Loading...</div>';

  try {
    const response = await fetch(`${API_BASE}/lookup/temp?email=${encodeURIComponent(email)}`);
    const data = await response.json();

    if (!response.ok) {
      tempLookupResults.innerHTML = '<div class="no-results">Email not found or expired</div>';
      return;
    }

    const resultHTML = `
      <div class="result-item">
        <div class="result-label">Personal Email Address</div>
        <div class="result-value">${escapeHtml(data.personalEmail)}</div>
      </div>
    `;
    tempLookupResults.innerHTML = resultHTML;
  } catch (error) {
    console.error('Error looking up email:', error);
    showError('Failed to lookup email');
    tempLookupResults.innerHTML = '';
  }
}

function displayLookupResults(emails, container) {
  if (!emails || emails.length === 0) {
    container.innerHTML = '<div class="no-results">No temporary emails found</div>';
    return;
  }

  const resultsHTML = emails.map(email => {
    const createdAt = new Date(email.createdAt);
    const expiresAt = new Date(email.expiresAt);
    const now = Date.now();
    const isExpired = expiresAt.getTime() <= now;

    return `
      <div class="result-item ${isExpired ? 'expired' : ''}">
        <div class="result-label">Temporary Email Address</div>
        <div class="result-value">${escapeHtml(email.tempEmail)}</div>
        <div class="result-info">
          Created: ${createdAt.toLocaleString()}<br>
          Expires: ${expiresAt.toLocaleString()} ${isExpired ? '(Expired)' : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = resultsHTML;
}

// ==================== UI HELPERS ====================

function switchTab(tabName) {
  tabBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    }
  });

  tabContents.forEach(content => {
    content.classList.remove('active');
    if (content.id === tabName) {
      content.classList.add('active');
    }
  });

  clearMessages();
}

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
  initializeAuth();

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
