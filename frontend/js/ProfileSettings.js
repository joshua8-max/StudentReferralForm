// Counselor/Staff ProfileSettings.js

document.addEventListener("DOMContentLoaded", async () => {
  // Highlight active nav item
  const navItems = document.querySelectorAll(".nav-item");
  const currentPage = window.location.pathname.split("/").pop().toLowerCase();

  navItems.forEach(item => {
    const itemHref = item.getAttribute("href").split("/").pop().toLowerCase();
    if (itemHref === currentPage) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });

  // Profile dropdown functionality
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

  // Load user profile and display welcome message
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


  // --------------------------
  // LOAD USER PROFILE
  // --------------------------
  async function loadUserProfile() {
    try {
      // Check if user is logged in (using correct token name)
      const token = localStorage.getItem("authToken");
      
      if (!token) {
        // Use customAlert if available, otherwise fallback
        if (typeof customAlert !== 'undefined') {
          customAlert.error("Please login first");
        }
        setTimeout(() => {
          window.location.href = "../../pages/LoginForm.html";
        }, 2000);
        return;
      }

      // Use API Client
      const response = await apiClient.getUserProfile();
      
      console.log("Profile Response:", response);

      if (response.success && response.data) {
        displayUserProfile(response.data);
      } else {
        if (typeof customAlert !== 'undefined') {
          customAlert.error(response.message || "Failed to load profile");
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      if (typeof customAlert !== 'undefined') {
        customAlert.error("Error loading profile");
      }
    }
  }

  // --------------------------
  // DISPLAY USER PROFILE
  // --------------------------
  function displayUserProfile(user) {
    console.log("Displaying user:", user);
    
    // Update profile header (top section with photo)
    const profileHeaderName = document.querySelector(".profile-text h3");
    const profileHeaderRole = document.querySelector(".profile-text p");
    
    if (profileHeaderName) {
      profileHeaderName.textContent = user.fullName || user.username;
    }
    if (profileHeaderRole) {
      profileHeaderRole.textContent = getRoleDisplayName(user.role);
    }

    // Get the input groups (they're in order: Full Name, Email)
    const inputGroups = document.querySelectorAll(".profile-details .input-group");
    
    console.log("Found input groups:", inputGroups.length);

    if (inputGroups.length >= 2) {
      // First input group = Full Name
      const fullNameInput = inputGroups[0].querySelector("input");
      // Second input group = Email
      const emailInput = inputGroups[1].querySelector("input");

      if (fullNameInput) {
        fullNameInput.value = user.fullName || "";
        fullNameInput.readOnly = true;
        fullNameInput.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        fullNameInput.style.color = "#ffffff";
        fullNameInput.style.cursor = "not-allowed";
        fullNameInput.style.opacity = "1";
        console.log("Set Full Name to:", fullNameInput.value);
      }

      if (emailInput) {
        emailInput.value = user.email || "";
        emailInput.readOnly = true;
        emailInput.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
        emailInput.style.color = "#ffffff";
        emailInput.style.cursor = "not-allowed";
        emailInput.style.opacity = "1";
        console.log("Set Email to:", emailInput.value);
      }
    } else {
      console.error("Could not find input groups!");
    }
  }

  // --------------------------
  // GET ROLE DISPLAY NAME
  // --------------------------
  function getRoleDisplayName(role) {
    const roleNames = {
      "Admin": "Administrator",
      "Teacher": "Teacher / Adviser",
      "Counselor": "Counselor"
    };
    return roleNames[role] || role;
  }

  // --------------------------
  // REMOVED: Logout functionality
  // Now handled by logout.js
  // --------------------------

  // --------------------------
  // LOAD PROFILE ON PAGE LOAD
  // --------------------------
  loadUserProfile();
});