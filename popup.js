// UI Elements
const meetingsList = document.getElementById('meetings-list');
const meetingNameInput = document.getElementById('meetingName');
const meetingLinkInput = document.getElementById('meetingLink');
const saveButton = document.getElementById('saveMeeting');

// Notification system
let activeNotificationTimeout;
function showNotification(message, type = 'success') {
  // Clear any existing notification timeout
  if (activeNotificationTimeout) {
    clearTimeout(activeNotificationTimeout);
  }

  const container = document.getElementById('notifications');
  
  // Remove existing notifications
  container.innerHTML = '';
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <span class="notification-message">${message}</span>
      <button class="notification-close" aria-label="Close notification">
        <span class="material-icons">close</span>
      </button>
    </div>
  `;
  
  container.appendChild(notification);

  // Add click handler for close button
  const closeBtn = notification.querySelector('.notification-close');
  closeBtn.addEventListener('click', () => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300);
  });
  
  // Set a longer timeout (5 seconds)
  activeNotificationTimeout = setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      notification.remove();
    }, 300); // Wait for fade animation
  }, 5000);
}

// Load saved meetings
async function getMeetings() {
  const { meetings = [] } = await chrome.storage.local.get('meetings');
  return meetings;
}

async function renderMeetings() {
  const meetings = await getMeetings();
  
  if (meetings.length === 0) {
    meetingsList.innerHTML = `
      <div class="empty-state">
        <span class="material-icons">event_busy</span>
        <p>No saved meetings yet</p>
      </div>
    `;
    return;
  }
  
  meetingsList.innerHTML = '';
  meetings.forEach(meeting => {
    const meetingEl = document.createElement('div');
    meetingEl.className = 'meeting-item';
    meetingEl.innerHTML = `
      <div class="meeting-info">
        <div class="meeting-name">${meeting.name}</div>
        <div class="meeting-link">${meeting.link}</div>
      </div>
      <div class="meeting-actions">
        <button class="icon-button" aria-label="Join meeting">
          <span class="material-icons">video_camera_front</span>
        </button>
        <button class="icon-button" aria-label="Copy meeting link">
          <span class="material-icons">content_copy</span>
        </button>
        <button class="icon-button delete-btn" aria-label="Delete meeting">
          <span class="material-icons">delete</span>
        </button>
      </div>
    `;

    // Add event listeners for actions
    const [joinBtn, copyBtn, deleteBtn] = meetingEl.querySelectorAll('.icon-button');

    joinBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: meeting.link });
    });

    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(meeting.link);
      showNotification('Meeting link copied!', 'success');
    });

    deleteBtn.addEventListener('click', () => {
      showModal(meeting);
    });

    meetingsList.appendChild(meetingEl);
  });
}

// Modal handling
const modal = document.getElementById('confirm-modal');
const modalOverlay = modal.querySelector('.modal-overlay');
const cancelDeleteBtn = document.getElementById('cancel-delete');
const confirmDeleteBtn = document.getElementById('confirm-delete');
let meetingToDelete = null;

function showModal(meeting) {
  meetingToDelete = meeting;
  modal.setAttribute('aria-hidden', 'false');
  document.querySelector('.meeting-to-delete').textContent = meeting.name;
  
  // Focus the cancel button by default (safer option)
  cancelDeleteBtn.focus();
  
  // Handle keyboard navigation
  const focusableElements = modal.querySelectorAll('button');
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  modal.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      hideModal();
    }
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
}

function hideModal() {
  modal.setAttribute('aria-hidden', 'true');
  meetingToDelete = null;
}

// Close modal when clicking overlay
modalOverlay.addEventListener('click', hideModal);
  
// Close modal when clicking cancel
cancelDeleteBtn.addEventListener('click', hideModal);
  
// Handle delete confirmation
confirmDeleteBtn.addEventListener('click', async () => {
  if (meetingToDelete) {
    const meetings = await getMeetings();
    const updatedMeetings = meetings.filter(m => m.id !== meetingToDelete.id);
    await chrome.storage.local.set({ meetings: updatedMeetings });
    hideModal();
    renderMeetings();
    showNotification('Meeting deleted', 'success');
  }
});

// Save meeting
saveButton.addEventListener('click', async () => {
  try {
    const name = meetingNameInput.value.trim();
    const link = meetingLinkInput.value.trim();

    if (!name || !link) {
      throw new Error('Please enter both meeting name and link');
    }

    // Validate Meet URL
    const meetUrlPattern = /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i;
    if (!meetUrlPattern.test(link)) {
      throw new Error('Please enter a valid Google Meet link');
    }

    const meetings = await getMeetings();
    meetings.push({ name, link });
    await chrome.storage.local.set({ meetings });

    meetingNameInput.value = '';
    meetingLinkInput.value = '';
    
    renderMeetings();
    showNotification('Meeting saved successfully', 'success');
  } catch (error) {
    showNotification(error.message, 'error');
  }
});

// Tab Switching
document.addEventListener('DOMContentLoaded', async () => {
  // Form elements
  const form = document.getElementById('meeting-form');
  const nameInput = document.getElementById('meetingName');
  const linkInput = document.getElementById('meetingLink');

  // Restore form data
  async function restoreFormData() {
    const { formData = {} } = await chrome.storage.local.get('formData');
    nameInput.value = formData.name || '';
    linkInput.value = formData.link || '';
  }

  // Save form data
  async function saveFormData() {
    const formData = {
      name: nameInput.value,
      link: linkInput.value
    };
    await chrome.storage.local.set({ formData });
  }

  // Add input event listeners to save form data as user types
  nameInput.addEventListener('input', saveFormData);
  linkInput.addEventListener('input', saveFormData);

  // Tab Switching
  const tabs = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and panels
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      
      // Add active class to clicked tab and its panel
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      const panel = document.getElementById(tab.getAttribute('aria-controls'));
      panel.classList.add('active');

      // Update aria-selected for all tabs
      tabs.forEach(t => {
        if (t !== tab) {
          t.setAttribute('aria-selected', 'false');
        }
      });
    });
  });

  // Form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    try {
      const name = nameInput.value.trim();
      const link = linkInput.value.trim();

      if (!name) throw new Error('Please enter a meeting name');
      if (!link) throw new Error('Please enter a meeting link');
      if (!link.startsWith('https://meet.google.com/')) {
        throw new Error('Please enter a valid Google Meet link');
      }

      const meetings = await getMeetings();
      meetings.push({ name, link, id: Date.now() });
      await chrome.storage.local.set({ meetings });

      // Clear form and form data in storage
      form.reset();
      await chrome.storage.local.remove('formData');

      // Show success notification
      showNotification('Meeting saved successfully', 'success');
      
      // Switch to saved meetings tab
      document.getElementById('saved-tab').click();
      
      // Update meetings list
      renderMeetings();
    } catch (error) {
      showNotification(error.message, 'error');
    }
  });

  // Initialize
  await restoreFormData();
  renderMeetings();
});
