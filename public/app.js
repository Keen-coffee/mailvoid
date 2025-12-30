// API Base URL
const API_BASE = '/api';

// DOM Elements
const personalEmailInput = document.getElementById('personalEmail');
const generateBtn = document.getElementById('generateBtn');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const generatedSection = document.getElementById('generatedSection');
const tempEmailDisplay = document.getElementById('tempEmailDisplay');
const copyBtn = document.getElementById('copyBtn');
const newEmailBtn = document.getElementById('newEmailBtn');
const expiryTimer = document.getElementById('expiryTimer');
const expiryProgress = document.getElementById('expiryProgress');

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

// Event Listeners
personalEmailInput.addEventListener('input', validateEmail);
generateBtn.addEventListener('click', generateEmail);
copyBtn.addEventListener('click', copyToClipboard);
newEmailBtn.addEventListener('click', resetForm);

// Tab switching
tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.getAttribute('data-tab');
    switchTab(tabName);
  });
});

// Lookup buttons
lookupPersonalBtn.addEventListener('click', lookupByPersonalEmail);
lookupTempBtn.addEventListener('click', lookupByTempEmail);

// Enter key support
lookupPersonalInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') lookupByPersonalEmail();
});

lookupTempInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') lookupByTempEmail();
});

/**
 * Validate email input and enable/disable generate button
 */
function validateEmail() {
  const email = personalEmailInput.value.trim();
  const isValid = email.length > 0 && email.includes('@');
  generateBtn.disabled = !isValid;
  
  if (isValid) {
    clearMessages();
  }
}

/**
 * Generate a temporary email
 */
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

    // Start expiry timer
    startExpiryTimer(data.expiresIn);
  } catch (error) {
    console.error('Error generating email:', error);
    showError('Failed to generate email. Please try again.');
    generateBtn.disabled = false;
  }
}

/**
 * Display the generated email
 */
function displayGeneratedEmail(tempEmail, expiresIn) {
  tempEmailDisplay.textContent = tempEmail;
  generatedSection.classList.remove('hidden');
  
  // Scroll to the generated email section
  setTimeout(() => {
    generatedSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 100);
}

/**
 * Start the expiry timer
 */
function startExpiryTimer(expiresIn) {
  let timeLeft = expiresIn;
  const startTime = Date.now();
  const endTime = startTime + expiresIn;

  // Clear any existing interval
  if (expiryInterval) clearInterval(expiryInterval);

  // Update every 100ms for smooth animation
  expiryInterval = setInterval(() => {
    const now = Date.now();
    const remaining = endTime - now;

    if (remaining <= 0) {
      clearInterval(expiryInterval);
      expiryTimer.textContent = 'Expired';
      expiryProgress.style.width = '0%';
      generatedSection.classList.add('expired');
      return;
    }

    // Calculate remaining time
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    expiryTimer.textContent = `${minutes}m ${seconds}s`;

    // Update progress bar
    const percentage = ((expiresIn - remaining) / expiresIn) * 100;
    expiryProgress.style.width = percentage + '%';
  }, 100);
}

/**
 * Copy temp email to clipboard
 */
async function copyToClipboard() {
  if (!currentTempEmail) return;

  try {
    await navigator.clipboard.writeText(currentTempEmail);
    
    // Show feedback
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

/**
 * Reset form and hide generated section
 */
function resetForm() {
  generatedSection.classList.add('hidden');
  if (expiryInterval) clearInterval(expiryInterval);
  currentTempEmail = null;
  currentExpiresAt = null;
  generateBtn.disabled = false;
  clearMessages();
}

/**
 * Lookup by personal email
 */
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

    displayLookupResults(data.tempEmails, personalLookupResults, 'temp');
  } catch (error) {
    console.error('Error looking up emails:', error);
    showError('Failed to lookup emails');
    personalLookupResults.innerHTML = '';
  }
}

/**
 * Lookup by temp email
 */
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

/**
 * Display lookup results
 */
function displayLookupResults(emails, container, type) {
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

/**
 * Switch between tabs
 */
function switchTab(tabName) {
  // Update buttons
  tabBtns.forEach(btn => {
    btn.classList.remove('active');
    if (btn.getAttribute('data-tab') === tabName) {
      btn.classList.add('active');
    }
  });

  // Update content
  tabContents.forEach(content => {
    content.classList.remove('active');
    if (content.id === tabName) {
      content.classList.add('active');
    }
  });

  clearMessages();
}

/**
 * Show error message
 */
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
  successMessage.classList.remove('show');
}

/**
 * Show success message
 */
function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('show');
  errorMessage.classList.remove('show');
}

/**
 * Clear all messages
 */
function clearMessages() {
  errorMessage.classList.remove('show');
  successMessage.classList.remove('show');
  errorMessage.textContent = '';
  successMessage.textContent = '';
}

/**
 * Escape HTML special characters
 */
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

// Initial validation
validateEmail();

// Health check
fetch(`${API_BASE}/health`)
  .catch(() => {
    console.warn('Server health check failed');
  });
