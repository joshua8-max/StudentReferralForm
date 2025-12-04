// Teacher/Adviser Referral.js - Frontend JavaScript for Referral Management
// This handles loading, filtering, creating, and updating referrals for teachers/advisers

console.log("📋 Referral.js loaded");

// ============================================
// GLOBAL STATE
// ============================================
let allReferrals = [];
let currentUser = null;

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", async () => {

  // --------------------------
  // ACTIVE NAV ITEM HIGHLIGHT
  // --------------------------
  const navItems = document.querySelectorAll(".nav-item");
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  navItems.forEach(item => {
    const itemHref = item.getAttribute("href").split("/").pop().toLowerCase();
    item.classList.toggle("active", itemHref === currentPage);
  });

  // --------------------------
  // PROFILE DROPDOWN
  // --------------------------
  const profileButton = document.getElementById("profileButton");
  const profileDropdown = document.getElementById("profileDropdown");

  if (profileButton && profileDropdown) {
    profileButton.addEventListener("click", (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle("show");
    });

    window.addEventListener("click", (event) => {
      if (!event.target.closest("#profileDropdown")) {
        profileDropdown.classList.remove("show");
      }
    });
  }

  console.log("🚀 Initializing Referral Management...");

  // Check authentication
  const token = localStorage.getItem("authToken");
  if (!token) {
    console.warn("⚠️ No auth token found, redirecting to login...");
    window.location.href = "../../pages/LoginForm.html";
    return;
  }

  // Get current user info
  const currentUserStr = localStorage.getItem("currentUser");
  if (currentUserStr) {
    currentUser = JSON.parse(currentUserStr);
    console.log("👤 Current user:", currentUser);
  }

  // Initialize page
  await loadReferrals();
  initializeEventListeners();
  initializeGradeFilter();
});

// ============================================
// LOAD REFERRALS - TEACHER/ADVISER SPECIFIC
// ============================================
async function loadReferrals() {
  console.log("📄 Loading teacher's referrals...");
  
  try {
    // Use the /my-referrals endpoint for teachers
    const response = await apiClient.get("/referrals/my-referrals");
    
    if (response.success) {
      allReferrals = response.data || [];
      console.log(`✅ Loaded ${allReferrals.length} referrals`);
      displayReferrals(allReferrals);
    } else {
      console.error("❌ Failed to load referrals:", response.error);
      showAlert(response.error || "Failed to load referrals", "error");
      displayReferrals([]);
    }
  } catch (error) {
    console.error("❌ Error loading referrals:", error);
    showAlert("Error loading referrals: " + error.message, "error");
    displayReferrals([]);
  }
}

// ============================================
// DISPLAY REFERRALS IN TABLE
// ============================================
function displayReferrals(referrals) {
  const tableBody = document.getElementById("studentTable");
  
  if (!tableBody) {
    console.error("❌ Table body not found");
    return;
  }

  if (!referrals || referrals.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; padding: 2rem; color: #666;">
          No referrals found. Click "Add Client Referral" to create one.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = referrals.map(referral => {
    const date = new Date(referral.referralDate || referral.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });

    // Status badge colors
    const statusColors = {
      'Pending': '#fbbf24',
      'Under Review': '#60a5fa',
      'For Consultation': '#a78bfa',
      'Complete': '#34d399'
    };

    // Severity badge colors
    const severityColors = {
      'Low': '#34d399',
      'Medium': '#fbbf24',
      'High': '#f87171',
      'Pending Assessment': '#9ca3af'
    };

    return `
      <tr data-id="${referral._id}">
        <td><strong>${referral.referralId || 'N/A'}</strong></td>
        <td>${referral.studentId || 'N/A'}</td>
        <td>${referral.studentName}</td>
        <td>${referral.level}</td>
        <td>${referral.grade}</td>
        <td>
          <span class="status-badge" style="background-color: ${statusColors[referral.status] || '#9ca3af'}20; color: ${statusColors[referral.status] || '#9ca3af'}; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 500;">
            ${referral.status}
          </span>
        </td>
        <td>
          <span class="severity-badge" style="background-color: ${severityColors[referral.severity] || '#9ca3af'}20; color: ${severityColors[referral.severity] || '#9ca3af'}; padding: 4px 12px; border-radius: 12px; font-size: 0.85rem; font-weight: 500;">
            ${referral.severity || 'Pending Assessment'}
          </span>
        </td>
        <td>${formattedDate}</td>
        <td>
          <button class="action-btn btn-view" onclick="viewReferral('${referral._id}')" title="View Details">
            <span class="material-symbols-outlined">visibility</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================
// FILTER REFERRALS
// ============================================
function filterReferrals() {
  const searchQuery = document.getElementById("searchInput")?.value.toLowerCase() || '';
  const levelFilter = document.getElementById("levelFilter")?.value || 'all';
  const gradeFilter = document.getElementById("GradeFilter")?.value || 'all'; // FIXED: Changed from 'grade' to 'GradeFilter'
  const severityFilter = document.getElementById("severityFilter")?.value || 'all';
  const statusFilter = document.getElementById("statusFilter")?.value || 'all';

  console.log("🔍 Filtering referrals:", { searchQuery, levelFilter, gradeFilter, severityFilter, statusFilter });

  let filtered = allReferrals.filter(referral => {
    // Search filter
    if (searchQuery && !referral.studentName.toLowerCase().includes(searchQuery) &&
        !referral.studentId?.toLowerCase().includes(searchQuery) &&
        !referral.referralId?.toLowerCase().includes(searchQuery)) {
      return false;
    }

    // Level filter
    if (levelFilter !== 'all' && referral.level !== levelFilter) {
      return false;
    }

    // Grade filter
    if (gradeFilter !== 'all' && referral.grade !== gradeFilter) {
      return false;
    }

    // Severity filter
    if (severityFilter !== 'all' && referral.severity !== severityFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'all' && referral.status !== statusFilter) {
      return false;
    }

    return true;
  });

  console.log(`✅ Filtered: ${filtered.length} of ${allReferrals.length} referrals`);
  displayReferrals(filtered);
}

// ============================================
// GRADE FILTER LOGIC - FIXED
// ============================================
function initializeGradeFilter() {
  // Main filter dropdowns
  const levelFilterMain = document.getElementById("levelFilter");
  const gradeFilterMain = document.getElementById("GradeFilter"); // FIXED: Changed from 'grade' to 'GradeFilter'

  if (levelFilterMain && gradeFilterMain) {
    levelFilterMain.addEventListener("change", () => {
      updateGradeOptions(levelFilterMain.value, gradeFilterMain);
      filterReferrals();
    });
    
    gradeFilterMain.addEventListener("change", () => {
      filterReferrals();
    });
  }

  // Modal form dropdowns (for add/edit)
  const levelAdd = document.getElementById("level");
  const gradeAdd = document.getElementById("grade");
  
  if (levelAdd && gradeAdd) {
    levelAdd.addEventListener("change", () => {
      updateGradeOptions(levelAdd.value, gradeAdd);
    });
  }

  const levelEdit = document.getElementById("edit-level");
  const gradeEdit = document.getElementById("edit-grade");
  
  if (levelEdit && gradeEdit) {
    levelEdit.addEventListener("change", () => {
      updateGradeOptions(levelEdit.value, gradeEdit);
    });
  }
}

function updateGradeOptions(level, gradeSelect) {
  if (!gradeSelect) return;

  const gradesByLevel = {
    'Elementary': ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'],
    'JHS': ['Grade 7', 'Grade 8', 'Grade 9', 'Grade 10'],
    'SHS': ['Grade 11', 'Grade 12']
  };

  // Check if this is the main filter dropdown
  const isFilterDropdown = gradeSelect.id === 'GradeFilter';
  
  // Clear existing options
  if (isFilterDropdown) {
    gradeSelect.innerHTML = '<option value="all">All Grades</option>';
  } else {
    gradeSelect.innerHTML = '<option value="">Select grade</option>';
  }
  
  if (level && level !== 'all' && gradesByLevel[level]) {
    gradeSelect.disabled = false;
    gradesByLevel[level].forEach(grade => {
      const option = document.createElement('option');
      option.value = grade;
      option.textContent = grade;
      gradeSelect.appendChild(option);
    });
  } else {
    gradeSelect.disabled = true;
    if (!isFilterDropdown) {
      gradeSelect.innerHTML = '<option value="">Select level first</option>';
    }
  }
}

// ============================================
// MODAL - ADD REFERRAL
// ============================================
function initializeEventListeners() {
  // Search and filters
  const searchInput = document.getElementById("searchInput");
  const levelFilter = document.getElementById("levelFilter");
  const gradeFilter = document.getElementById("GradeFilter"); // FIXED
  const severityFilter = document.getElementById("severityFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (searchInput) searchInput.addEventListener("input", filterReferrals);
  if (levelFilter) levelFilter.addEventListener("change", filterReferrals);
  if (gradeFilter) gradeFilter.addEventListener("change", filterReferrals);
  if (severityFilter) severityFilter.addEventListener("change", filterReferrals);
  if (statusFilter) statusFilter.addEventListener("change", filterReferrals);

  // Modal buttons
  const addBtn = document.getElementById("addReferralBtn");
  const closeModalBtn = document.getElementById("closeModalBtn");
  const cancelModalBtn = document.getElementById("cancelModalBtn");
  
  if (addBtn) addBtn.addEventListener("click", openAddModal);
  if (closeModalBtn) closeModalBtn.addEventListener("click", closeAddModal);
  if (cancelModalBtn) cancelModalBtn.addEventListener("click", closeAddModal);

  // Edit modal buttons
  const closeEditModalBtn = document.getElementById("closeEditModalBtn");
  const cancelEditModalBtn = document.getElementById("cancelEditModalBtn");
  
  if (closeEditModalBtn) closeEditModalBtn.addEventListener("click", closeEditModal);
  if (cancelEditModalBtn) cancelEditModalBtn.addEventListener("click", closeEditModal);

  // Form submissions
  const referralForm = document.getElementById("referralForm");
  const editReferralForm = document.getElementById("editReferralForm");
  
  if (referralForm) referralForm.addEventListener("submit", handleAddReferral);
  if (editReferralForm) editReferralForm.addEventListener("submit", handleUpdateReferral);

  // Student ID autocomplete
  const studentIdInput = document.getElementById("studentId");
  if (studentIdInput) {
    studentIdInput.addEventListener("input", handleStudentIdInput);
  }

  // Close modals when clicking outside
  window.addEventListener("click", (e) => {
    const addModal = document.getElementById("referralModal");
    const editModal = document.getElementById("editReferralModal");
    
    if (e.target === addModal) {
      closeAddModal();
    }
    if (e.target === editModal) {
      closeEditModal();
    }
  });
}

// ============================================
// STUDENT ID AUTOCOMPLETE
// ============================================
let searchTimeout;
async function handleStudentIdInput(e) {
  const query = e.target.value.trim();
  
  clearTimeout(searchTimeout);
  
  if (query.length < 2) {
    hideAutocomplete();
    return;
  }
  
  searchTimeout = setTimeout(async () => {
    try {
      const response = await apiClient.get(`/students/search?query=${encodeURIComponent(query)}`);
      
      if (response.success && response.data && response.data.length > 0) {
        showAutocomplete(response.data);
      } else {
        hideAutocomplete();
      }
    } catch (error) {
      console.error("Error searching students:", error);
      hideAutocomplete();
    }
  }, 300);
}

function showAutocomplete(students) {
  const studentIdInput = document.getElementById("studentId");
  let autocompleteContainer = document.getElementById('studentAutocomplete');
  
  if (!autocompleteContainer) {
    autocompleteContainer = document.createElement('div');
    autocompleteContainer.id = 'studentAutocomplete';
    autocompleteContainer.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #1a1a1a;
      border: 1px solid #10b981;
      border-radius: 6px;
      max-height: 200px;
      overflow-y: auto;
      z-index: 1000;
      margin-top: 4px;
    `;
    studentIdInput.parentElement.style.position = 'relative';
    studentIdInput.parentElement.appendChild(autocompleteContainer);
  }
  
  autocompleteContainer.innerHTML = students.map(student => `
    <div class="autocomplete-item" 
         data-student='${JSON.stringify(student)}'
         style="padding: 12px; cursor: pointer; border-bottom: 1px solid #333; color: #e0e0e0;">
      <div style="font-weight: 500;">${student.fullName}</div>
      <div style="font-size: 12px; color: #888;">${student.studentId} - ${student.level} ${student.grade}</div>
    </div>
  `).join('');
  
  autocompleteContainer.style.display = 'block';
  
  // Add click handlers
  autocompleteContainer.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('click', function() {
      const student = JSON.parse(this.getAttribute('data-student'));
      fillStudentData(student);
      hideAutocomplete();
    });
    
    item.addEventListener('mouseenter', function() {
      this.style.background = '#10b981';
      this.style.color = '#fff';
    });
    
    item.addEventListener('mouseleave', function() {
      this.style.background = 'transparent';
      this.style.color = '#e0e0e0';
    });
  });
}

function hideAutocomplete() {
  const autocompleteContainer = document.getElementById('studentAutocomplete');
  if (autocompleteContainer) {
    autocompleteContainer.style.display = 'none';
  }
}

function fillStudentData(student) {
  document.getElementById("studentName").value = student.fullName || '';
  document.getElementById("studentId").value = student.studentId || '';
  
  const levelSelect = document.getElementById("level");
  const gradeSelect = document.getElementById("grade");
  
  if (levelSelect && student.level) {
    levelSelect.value = student.level;
    updateGradeOptions(student.level, gradeSelect);
  }
  
  setTimeout(() => {
    if (gradeSelect && student.grade) {
      gradeSelect.value = student.grade;
    }
  }, 100);
  
  console.log("✅ Auto-filled student info:", student);
}

// ============================================
// OPEN/CLOSE ADD MODAL
// ============================================
function openAddModal() {
  const modal = document.getElementById("referralModal");
  const form = document.getElementById("referralForm");
  
  if (form) form.reset();
  
  // Set today's date as default
  const dateInput = document.getElementById("dateOfInterview");
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
  }
  
  // Reset grade dropdown
  const gradeSelect = document.getElementById("grade");
  if (gradeSelect) {
    gradeSelect.disabled = true;
    gradeSelect.innerHTML = '<option value="">Select level first</option>';
  }
  
  // Hide autocomplete dropdown
  const autocompleteContainer = document.getElementById('studentAutocomplete');
  if (autocompleteContainer) {
    autocompleteContainer.style.display = 'none';
  }
  
  if (modal) modal.style.display = "flex";
}

function closeAddModal() {
  const modal = document.getElementById("referralModal");
  const form = document.getElementById("referralForm");
  
  if (form) form.reset();
  
  // Hide autocomplete dropdown
  const autocompleteContainer = document.getElementById('studentAutocomplete');
  if (autocompleteContainer) {
    autocompleteContainer.style.display = 'none';
  }
  
  if (modal) modal.style.display = "none";
}

// ============================================
// HANDLE ADD REFERRAL
// ============================================
async function handleAddReferral(e) {
  e.preventDefault();
  
  const formData = {
    studentName: document.getElementById("studentName").value.trim(),
    studentId: document.getElementById("studentId").value.trim() || undefined,
    level: document.getElementById("level").value,
    grade: document.getElementById("grade").value,
    referralDate: document.getElementById("dateOfInterview").value,
    reason: document.getElementById("reason").value.trim(),
    description: document.getElementById("description").value.trim() || undefined,
    referredBy: currentUser?.fullName || currentUser?.username || undefined
  };

  console.log("📤 Submitting new referral:", formData);

  try {
    const response = await apiClient.createReferral(formData);
    
    if (response.success) {
      showAlert("Referral created successfully!", "success");
      closeAddModal();
      await loadReferrals();
    } else {
      showAlert(response.error || "Failed to create referral", "error");
    }
  } catch (error) {
    console.error("❌ Error creating referral:", error);
    showAlert("Error creating referral: " + error.message, "error");
  }
}

// ============================================
// VIEW REFERRAL
// ============================================
async function viewReferral(id) {
  console.log("👁️ Viewing referral:", id);
  
  try {
    const response = await apiClient.getReferralById(id);
    
    if (response.success && response.data) {
      openEditModal(response.data);
    } else {
      showAlert(response.error || "Failed to load referral", "error");
    }
  } catch (error) {
    console.error("❌ Error loading referral:", error);
    showAlert("Error loading referral: " + error.message, "error");
  }
}

// ============================================
// OPEN/CLOSE EDIT MODAL
// ============================================
function openEditModal(referral) {
  const modal = document.getElementById("editReferralModal");
  
  // Populate form
  document.getElementById("editReferralId").value = referral._id;
  document.getElementById("edit-referralId-display").value = referral.referralId || 'N/A';
  document.getElementById("edit-studentName").value = referral.studentName;
  document.getElementById("edit-studentId").value = referral.studentId || '';
  
  // Set adviser/referred by
  const adviserInput = document.getElementById("edit-adviser");
  if (adviserInput) {
    adviserInput.value = referral.referredBy || 
                         referral.createdBy?.fullName || 
                         referral.createdBy?.username || 
                         'N/A';
  }
  
  // Set level and trigger grade options update
  const editLevelSelect = document.getElementById("edit-level");
  const editGradeSelect = document.getElementById("edit-grade");
  
  if (editLevelSelect) {
    editLevelSelect.value = referral.level;
    updateGradeOptions(referral.level, editGradeSelect);
  }
  
  // Set grade after options are updated
  setTimeout(() => {
    if (editGradeSelect) {
      editGradeSelect.value = referral.grade;
    }
  }, 50);
  
  const dateInput = document.getElementById("edit-dateOfInterview");
  if (dateInput && referral.referralDate) {
    const date = new Date(referral.referralDate);
    dateInput.value = date.toISOString().split('T')[0];
  }
  
  document.getElementById("edit-status").value = referral.status;
  document.getElementById("edit-severity").value = referral.severity || 'Pending Assessment';
  document.getElementById("edit-reason").value = referral.reason;
  document.getElementById("edit-description").value = referral.description || '';
  
  // Category (if exists)
  const categorySection = document.getElementById("categorySection");
  const categoryInput = document.getElementById("edit-category");
  if (referral.category) {
    if (categorySection) categorySection.style.display = 'block';
    if (categoryInput) categoryInput.value = referral.category;
  } else {
    if (categorySection) categorySection.style.display = 'none';
  }
  
  // Notes (if exists)
  const notesSection = document.getElementById("notesSection");
  const notesInput = document.getElementById("edit-notes");
  if (referral.notes) {
    if (notesSection) notesSection.style.display = 'block';
    if (notesInput) notesInput.value = referral.notes;
  } else {
    if (notesSection) notesSection.style.display = 'none';
  }
  
  if (modal) modal.style.display = "flex";
}

function closeEditModal() {
  const modal = document.getElementById("editReferralModal");
  const form = document.getElementById("editReferralForm");
  
  if (form) form.reset();
  if (modal) modal.style.display = "none";
}

// ============================================
// HANDLE UPDATE REFERRAL
// ============================================
async function handleUpdateReferral(e) {
  e.preventDefault();
  
  const id = document.getElementById("editReferralId").value;
  
  const formData = {
    studentName: document.getElementById("edit-studentName").value.trim(),
    studentId: document.getElementById("edit-studentId").value.trim() || undefined,
    level: document.getElementById("edit-level").value,
    grade: document.getElementById("edit-grade").value,
    referralDate: document.getElementById("edit-dateOfInterview").value,
    reason: document.getElementById("edit-reason").value.trim(),
    description: document.getElementById("edit-description").value.trim() || undefined
  };

  console.log("📤 Updating referral:", id, formData);

  try {
    const response = await apiClient.updateReferral(id, formData);
    
    if (response.success) {
      showAlert("Referral updated successfully!", "success");
      closeEditModal();
      await loadReferrals();
    } else {
      showAlert(response.error || "Failed to update referral", "error");
    }
  } catch (error) {
    console.error("❌ Error updating referral:", error);
    showAlert("Error updating referral: " + error.message, "error");
  }
}

// ============================================
// UTILITY - SHOW ALERT
// ============================================
function showAlert(message, type = 'info') {
  if (typeof customAlert !== 'undefined') {
    customAlert(message, type);
  } else {
    alert(message);
  }
}

// ============================================
// MAKE FUNCTIONS GLOBAL
// ============================================
window.viewReferral = viewReferral;
window.filterReferrals = filterReferrals;