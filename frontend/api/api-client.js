// ========================================
// API CLIENT - PRODUCTION VERSION
// ========================================
// ⚠️ IMPORTANT: This points to Render.com production backend
const API_BASE_URL = "https://studentreferralforms.onrender.com/api";

console.log("🔧 API Client loaded - Base URL:", API_BASE_URL);

const apiClient = {
  // ========================================
  // AUTHENTICATION
  // ========================================
  
  async login(email, password) {
    try {
      console.log("🔐 Attempting login for:", email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("📡 Login response:", data);

      if (data.success && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        console.log("✅ Login successful, token saved");
        return data;
      }

      throw new Error(data.message || "Login failed");
    } catch (error) {
      console.error("❌ Login error:", error);
      throw error;
    }
  },

  logout() {
    console.log("👋 Logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getToken() {
    const token = localStorage.getItem("token");
    return token;
  },

  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // ========================================
  // REFERRALS (REF-xxx format)
  // ========================================
  
  async getReferrals(filters = {}) {
    try {
      console.log("📋 Fetching referrals with filters:", filters);
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const url = `${API_BASE_URL}/referrals${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log("📡 GET", url);
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        console.error("❌ Referrals fetch failed:", response.status);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Referrals fetched:", data.count || data.data?.length || 0);
      return data;
    } catch (error) {
      console.error("❌ Error fetching referrals:", error);
      throw error;
    }
  },

  async getReferralById(id) {
    try {
      console.log("🔍 Fetching referral by ID:", id);
      const response = await fetch(`${API_BASE_URL}/referrals/${id}`, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Referral fetched:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching referral:", error);
      throw error;
    }
  },

  async createReferral(referralData) {
    try {
      console.log("➕ Creating referral:", referralData);
      const response = await fetch(`${API_BASE_URL}/referrals`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(referralData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Referral created:", data);
      return data;
    } catch (error) {
      console.error("❌ Error creating referral:", error);
      throw error;
    }
  },

  async updateReferral(id, referralData) {
    try {
      console.log("📝 Updating referral:", id, referralData);
      const response = await fetch(`${API_BASE_URL}/referrals/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(referralData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Referral updated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating referral:", error);
      throw error;
    }
  },

  async deleteReferral(id) {
    try {
      console.log("🗑️ Deleting referral:", id);
      const response = await fetch(`${API_BASE_URL}/referrals/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Referral deleted:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting referral:", error);
      throw error;
    }
  },

  // ========================================
  // STUDENT SUBMISSIONS (SUB-xxx format)
  // ========================================
  
  async getStudentSubmissions(filters = {}) {
    try {
      console.log("📋 Fetching student submissions with filters:", filters);
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key]) queryParams.append(key, filters[key]);
      });

      const url = `${API_BASE_URL}/student-submissions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log("📡 GET", url);
      
      const response = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        console.error("❌ Student submissions fetch failed:", response.status, response.statusText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Student submissions fetched:", data.count || data.data?.length || 0, "items");
      return data;
    } catch (error) {
      console.error("❌ Error fetching student submissions:", error);
      throw error;
    }
  },

  async getStudentSubmissionById(id) {
    try {
      console.log("🔍 Fetching student submission by ID:", id);
      const response = await fetch(`${API_BASE_URL}/student-submissions/${id}`, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Student submission fetched:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching student submission:", error);
      throw error;
    }
  },

  async updateStudentSubmission(id, updateData) {
    try {
      console.log("📝 Updating student submission:", id, updateData);
      const response = await fetch(`${API_BASE_URL}/student-submissions/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Student submission updated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating student submission:", error);
      throw error;
    }
  },

  async deleteStudentSubmission(id) {
    try {
      console.log("🗑️ Deleting student submission:", id);
      const response = await fetch(`${API_BASE_URL}/student-submissions/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Student submission deleted:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting student submission:", error);
      throw error;
    }
  },

  // ========================================
  // USERS
  // ========================================
  
  async getUsers() {
    try {
      console.log("👥 Fetching users");
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Users fetched:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      throw error;
    }
  },

  async createUser(userData) {
    try {
      console.log("➕ Creating user:", userData);
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ User created:", data);
      return data;
    } catch (error) {
      console.error("❌ Error creating user:", error);
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      console.log("📝 Updating user:", id, userData);
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ User updated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating user:", error);
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      console.log("🗑️ Deleting user:", id);
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ User deleted:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting user:", error);
      throw error;
    }
  },

  // ========================================
  // STUDENTS
  // ========================================
  
  async getStudents() {
    try {
      console.log("🎓 Fetching students");
      const response = await fetch(`${API_BASE_URL}/students`, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Students fetched:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching students:", error);
      throw error;
    }
  },

  async createStudent(studentData) {
    try {
      console.log("➕ Creating student:", studentData);
      const response = await fetch(`${API_BASE_URL}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Student created:", data);
      return data;
    } catch (error) {
      console.error("❌ Error creating student:", error);
      throw error;
    }
  },

  async updateStudent(id, studentData) {
    try {
      console.log("📝 Updating student:", id, studentData);
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(studentData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Student updated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating student:", error);
      throw error;
    }
  },

  async deleteStudent(id) {
    try {
      console.log("🗑️ Deleting student:", id);
      const response = await fetch(`${API_BASE_URL}/students/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Student deleted:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting student:", error);
      throw error;
    }
  },

  // ========================================
  // CATEGORIES
  // ========================================
  
  async getCategories() {
    try {
      console.log("📂 Fetching categories");
      const response = await fetch(`${API_BASE_URL}/categories`, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Categories fetched:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      throw error;
    }
  },

  async createCategory(categoryData) {
    try {
      console.log("➕ Creating category:", categoryData);
      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Category created:", data);
      return data;
    } catch (error) {
      console.error("❌ Error creating category:", error);
      throw error;
    }
  },

  async updateCategory(id, categoryData) {
    try {
      console.log("📝 Updating category:", id, categoryData);
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(categoryData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Category updated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating category:", error);
      throw error;
    }
  },

  async deleteCategory(id) {
    try {
      console.log("🗑️ Deleting category:", id);
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Category deleted:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting category:", error);
      throw error;
    }
  },

  // ========================================
  // ADVISERS
  // ========================================
  
  async getAdvisers() {
    try {
      console.log("👨‍🏫 Fetching advisers");
      const response = await fetch(`${API_BASE_URL}/advisers`, {
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Advisers fetched:", data);
      return data;
    } catch (error) {
      console.error("❌ Error fetching advisers:", error);
      throw error;
    }
  },

  async createAdviser(adviserData) {
    try {
      console.log("➕ Creating adviser:", adviserData);
      const response = await fetch(`${API_BASE_URL}/advisers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(adviserData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Adviser created:", data);
      return data;
    } catch (error) {
      console.error("❌ Error creating adviser:", error);
      throw error;
    }
  },

  async updateAdviser(id, adviserData) {
    try {
      console.log("📝 Updating adviser:", id, adviserData);
      const response = await fetch(`${API_BASE_URL}/advisers/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.getToken()}`,
        },
        body: JSON.stringify(adviserData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Adviser updated:", data);
      return data;
    } catch (error) {
      console.error("❌ Error updating adviser:", error);
      throw error;
    }
  },

  async deleteAdviser(id) {
    try {
      console.log("🗑️ Deleting adviser:", id);
      const response = await fetch(`${API_BASE_URL}/advisers/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${this.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Adviser deleted:", data);
      return data;
    } catch (error) {
      console.error("❌ Error deleting adviser:", error);
      throw error;
    }
  },
};

console.log("✅ API Client initialized successfully");
