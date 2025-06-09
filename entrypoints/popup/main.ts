import './style.css';
import logo from '/logo.png';

// Define the HTML structure for the popup
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="popup-container">
    <img src="${logo}" class="logo" alt="Extension Logo" />
    <p id="status-message">Loading...</p>
    <p class="info-message">Use in-page buttons to download media from Instagram.</p>
  </div>
`;

const statusMessage = document.getElementById('status-message') as HTMLParagraphElement;

// Function to update popup UI based on the active tab
async function updatePopupStatus() {
  try {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });

    if (activeTab?.url && activeTab.url.includes('instagram.com')) {
      statusMessage.textContent = 'Active on Instagram!';
      statusMessage.style.color = '#76d7c4'; // A greenish color for active
    } else if (activeTab?.url && activeTab.url.includes('tiktok.com')) {
      statusMessage.textContent = 'Active on TikTok!';
      statusMessage.style.color = '#76d7c4';
    }
    else {
      statusMessage.textContent = 'Navigate to Instagram or TikTok to use.';
      statusMessage.style.color = '#f5b041'; // An orangish color for inactive
    }
  } catch (error) {
    console.error("Error querying active tab:", error);
    statusMessage.textContent = 'Error checking page status.';
    statusMessage.style.color = '#e74c3c'; // A reddish color for error
  }
}

// Initialize UI when popup opens
updatePopupStatus();

// Listen for tab changes to update UI if popup stays open
browser.tabs.onUpdated.addListener(updatePopupStatus);
browser.tabs.onActivated.addListener(updatePopupStatus);
