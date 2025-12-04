//Teacher/Adviser Home.js - ENHANCED RESPONSIVE VERSION

document.addEventListener("DOMContentLoaded", async () => {
  // ========== RESPONSIVE SIDEBAR FUNCTIONALITY ==========
  const sidebarToggle = document.getElementById('sidebarToggle');
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const mainContent = document.querySelector('.main-content');

  // Function to open sidebar
  function openSidebar() {
    sidebar.classList.add('active');
    if (sidebarOverlay) {
      sidebarOverlay.classList.add('active');
    }
  }

  // Function to close sidebar
  function closeSidebar() {
    sidebar.classList.remove('active');
    if (sidebarOverlay) {
      sidebarOverlay.classList.remove('active');
    }
  }

  // Toggle sidebar on hamburger click (for mobile)
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  // Toggle sidebar on menu button click
  if (menuToggle) {
    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (sidebar.classList.contains('active')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });
  }

  // Close sidebar when clicking overlay
  if (sidebarOverlay) {
    sidebarOverlay.addEventListener('click', closeSidebar);
  }

  // Close sidebar when clicking on main content (mobile only)
  if (mainContent) {
    mainContent.addEventListener('click', function() {
      if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        closeSidebar();
      }
    });
  }

  // Close sidebar when clicking outside (mobile only)
  document.addEventListener('click', function(e) {
    if (window.innerWidth <= 768) {
      if (!sidebar.contains(e.target) && 
          !sidebarToggle?.contains(e.target) && 
          !menuToggle?.contains(e.target)) {
        closeSidebar();
      }
    }
  });

  // Handle window resize - close sidebar when expanding to desktop
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 768) {
        closeSidebar();
      }
    }, 250);
  });

  // ========== NAVIGATION ACTIVE STATE ==========
  const navItems = document.querySelectorAll(".nav-item");
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  navItems.forEach(item => {
    const itemHref = item.getAttribute("href").split("/").pop().toLowerCase();
    if (itemHref === currentPage) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
    
    // Close sidebar when nav item is clicked on mobile
    item.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        closeSidebar();
      }
    });
  });

  // ========== PROFILE DROPDOWN ==========
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

  // ========== LOAD USER PROFILE ==========
  try {
    const userProfile = await apiClient.getUserProfile();
    if (userProfile.success && userProfile.data) {
      const welcomeTitle = document.getElementById("welcomeTitle");
      if (welcomeTitle) {
        welcomeTitle.textContent = `Welcome back, ${userProfile.data.fullName || userProfile.data.username}`;
      }
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
  }
  
  // ========== LOAD REFERRALS ==========
  loadRecentReferrals();
});

// Load recent referrals
async function loadRecentReferrals() {
  try {
    const response = await apiClient.get('/referrals/recent');
    
    if (response.success) {
      displayRecentReferrals(response.data);
    } else {
      console.error('Failed to load recent referrals');
    }
  } catch (error) {
    console.error('Error loading recent referrals:', error);
    const tbody = document.getElementById('studentTable');
    if (tbody) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Error loading referrals</td></tr>';
    }
  }
}

// Display recent referrals in table
function displayRecentReferrals(referrals) {
  const tbody = document.getElementById('studentTable');
  if (!tbody) return;

  if (referrals.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">No referrals yet</td></tr>';
    return;
  }

  tbody.innerHTML = referrals.map(referral => `
    <tr>
      <td>${referral.referralId}</td>
      <td>${referral.studentName}</td>
      <td>${new Date(referral.createdAt).toLocaleDateString()}</td>
      <td><span class="btn-view-status status-${referral.status.replace(/\s+/g, '-').toLowerCase()}">${referral.status}</span></td>
    </tr>
  `).join('');
}