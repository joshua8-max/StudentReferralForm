// Student_Form.js - GitHub Pages Version
// ⚠️ IMPORTANT: Set your backend URL below!

// ========================================
// CONFIGURATION - UPDATE THIS!
// ========================================
const BACKEND_URL = 'https://studentreferralforms.onrender.com'; 
// ☝️ Replace with your hosted backend URL, examples:
// 'https://your-app.herokuapp.com'
// 'https://your-app.onrender.com'
// 'https://your-app.railway.app'
// ========================================

// Proceed from Instructions to Form
document.getElementById('proceedBtn').addEventListener('click', () => {
  document.getElementById('instructionsScreen').style.display = 'none';
  document.getElementById('formScreen').style.display = 'block';
});

// Back to Instructions from Form
document.getElementById('backToInstructionsBtn').addEventListener('click', () => {
  document.getElementById('formScreen').style.display = 'none';
  document.getElementById('instructionsScreen').style.display = 'block';
});

// Submit Another Concern - Reset to Form
document.getElementById('submitAnotherBtn').addEventListener('click', () => {
  document.getElementById('confirmationScreen').style.display = 'none';
  document.getElementById('formScreen').style.display = 'block';
  document.getElementById('complaintForm').reset();
  document.getElementById('nameInputGroup').style.display = 'none';
});

// ==================== Name Option Handling ====================

document.getElementById('nameOption').addEventListener('change', function() {
  const nameInputGroup = document.getElementById('nameInputGroup');
  const studentNameInput = document.getElementById('studentName');
  const nameLabel = document.getElementById('nameLabel');
  const selectedOption = this.value;
  
  if (selectedOption === 'realName') {
    nameInputGroup.style.display = 'block';
    nameLabel.textContent = 'Your Name';
    studentNameInput.placeholder = 'Enter your full name';
    studentNameInput.required = true;
    studentNameInput.value = '';
  } else if (selectedOption === 'anonymous') {
    nameInputGroup.style.display = 'block';
    nameLabel.textContent = 'Anonymous Name (Optional)';
    studentNameInput.placeholder = 'e.g., Worried Student, Student123, etc.';
    studentNameInput.required = false;
    studentNameInput.value = '';
  } else if (selectedOption === 'preferNot') {
    nameInputGroup.style.display = 'none';
    studentNameInput.required = false;
    studentNameInput.value = 'Anonymous';
  }
});

// ==================== Form Submission ====================

document.getElementById('complaintForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.textContent;
  submitBtn.textContent = 'Submitting...';
  submitBtn.disabled = true;

  try {
    // Get form data
    const nameOption = document.getElementById('nameOption').value;
    let studentName = 'Anonymous';
    
    if (nameOption === 'realName') {
      studentName = document.getElementById('studentName').value.trim();
      if (!studentName) {
        showError('Please enter your name');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
      }
    } else if (nameOption === 'anonymous') {
      const anonymousName = document.getElementById('studentName').value.trim();
      studentName = anonymousName || 'Anonymous';
    } else if (nameOption === 'preferNot') {
      studentName = 'Prefer not to say';
    }

    const concern = document.getElementById('concern').value.trim();
    
    if (!concern) {
      showError('Please describe your concern');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
      return;
    }

    // Prepare form data
    const formData = {
      studentName: studentName,
      concern: concern,
      nameOption: nameOption
    };

    console.log("📝 Submitting to:", `${BACKEND_URL}/api/public-referrals`);
    console.log("📝 Form data:", formData);
      
    // Submit to backend
    const fetchResponse = await fetch(`${BACKEND_URL}/api/public-referrals`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    const data = await fetchResponse.json();
    console.log("📥 Server response:", data);

    if (fetchResponse.ok && data.success) {
      // Extract referral ID
      const referralId = data.data?.referralId || data.referralId || 'N/A';
      
      console.log("✅ Success! Referral ID:", referralId);
      
      showConfirmation(referralId);
      
      // Reset form
      document.getElementById('complaintForm').reset();
      document.getElementById('nameInputGroup').style.display = 'none';
    } else {
      const errorMessage = data.error || data.message || 'Failed to submit concern';
      console.error('❌ Submission failed:', errorMessage);
      showError(errorMessage);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  } catch (error) {
    console.error('❌ Error:', error);
    
    let errorMessage = 'Network error. Please check your connection and try again.';
    
    if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    if (error.message.includes('fetch')) {
      errorMessage = `Cannot connect to server at ${BACKEND_URL}. Please make sure your backend is running and BACKEND_URL is correct.`;
    }
    
    showError(errorMessage);
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  }
});

// ==================== Show Confirmation ====================

function showConfirmation(referralId) {
  document.getElementById('formScreen').style.display = 'none';
  document.getElementById('confirmationScreen').style.display = 'block';
  
  document.getElementById('displayReferralId').textContent = referralId;
  
  const submitBtn = document.querySelector('#complaintForm button[type="submit"]');
  submitBtn.textContent = 'Submit Concern';
  submitBtn.disabled = false;
  
  console.log("✅ Confirmation shown with ID:", referralId);
}

// ==================== Show Error ====================

function showError(message) {
  console.error("⚠️ Error:", message);
  
  let errorDiv = document.getElementById('errorAlert');
  
  if (!errorDiv) {
    errorDiv = document.createElement('div');
    errorDiv.id = 'errorAlert';
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #fee;
      color: #c33;
      padding: 15px 20px;
      border-radius: 8px;
      border-left: 4px solid #c33;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      z-index: 10000;
      max-width: 400px;
      animation: slideIn 0.3s ease-out;
      font-family: Arial, sans-serif;
      font-size: 14px;
    `;
    document.body.appendChild(errorDiv);
  }
  
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 7000);
}

// CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log("✅ Student Form initialized (GitHub Pages version)");
  console.log("📡 Backend URL:", BACKEND_URL);
  
  if (BACKEND_URL === 'http://localhost:3000') {
    console.warn("⚠️ WARNING: Using localhost backend URL. Update BACKEND_URL constant for production!");
  }
});
