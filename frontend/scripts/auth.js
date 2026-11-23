/**
 * ============================================================================
 * PROJECTHUB AI - AUTHENTICATION CLIENT LOGIC
 * Manages login, registration form submission, validation, and role redirection.
 * ============================================================================
 */

const AuthModule = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // Switch between Student Login, Admin Login, and Student Registration
    const roleTabs = document.querySelectorAll('.auth-tab');
    roleTabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        const targetView = e.currentTarget.getAttribute('data-view');
        this.switchAuthView(targetView);
      });
    });

    // Student Login Form
    const studentLoginForm = document.getElementById('studentLoginForm');
    if (studentLoginForm) {
      studentLoginForm.addEventListener('submit', (e) => this.handleStudentLogin(e));
    }

    // Admin Login Form
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
    }

    // Student Registration Form
    const registerForm = document.getElementById('studentRegisterForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleStudentRegister(e));
    }
  },

  switchAuthView(viewName) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('is-active'));
    document.querySelectorAll('.auth-view-panel').forEach(p => p.style.display = 'none');

    const activeTab = document.querySelector(`.auth-tab[data-view="${viewName}"]`);
    const activePanel = document.getElementById(`panel-${viewName}`);

    if (activeTab) activeTab.classList.add('is-active');
    if (activePanel) {
      activePanel.style.display = 'block';
      activePanel.classList.add('animate-fade-in-up');
    }

    // Keep URL hash in sync
    if (viewName === 'student-login') window.history.replaceState(null, null, '#login-student');
    else if (viewName === 'admin-login') window.history.replaceState(null, null, '#login-admin');
    else if (viewName === 'register') window.history.replaceState(null, null, '#register');
  },

  /**
   * 1-Click Instant Demo Login: Student (Alex Morgan)
   */
  async quickLoginStudent() {
    try {
      const response = await window.ProjectHubAPI.request('/auth/login/student', {
        method: 'POST',
        body: JSON.stringify({ identifier: '1MS21CS001', password: 'Password@123' })
      });
      if (response.success) {
        window.ProjectHubAPI.setToken(response.token);
        window.ProjectHubAPI.setUser(response.user);
        window.ProjectHubApp.showToast(`Logged in as ${response.user.fullName} (${response.user.department}-${response.user.year}-${response.user.section})!`, 'success');
        window.location.hash = 'student-dashboard';
        window.ProjectHubApp.navigate('student-dashboard');
      }
    } catch (e) {
      // Fallback
      const student = window.ProjectHubMock ? window.ProjectHubMock.currentUser : { id: 'stu-01', fullName: 'Alex Morgan', usn: '1MS21CS001', department: 'CSE', year: 3, section: 'A', role: 'STUDENT' };
      window.ProjectHubAPI.setToken('jwt-student-live-token-' + student.id);
      window.ProjectHubAPI.setUser(student);
      window.location.hash = 'student-dashboard';
      window.ProjectHubApp.navigate('student-dashboard');
    }
  },

  /**
   * 1-Click Instant Demo Login: Faculty Admin (Prof. Sarah Chen)
   */
  async quickLoginAdmin() {
    try {
      const response = await window.ProjectHubAPI.request('/auth/login/admin', {
        method: 'POST',
        body: JSON.stringify({ email: 'sarah.chen@college.edu', password: 'Password@123' })
      });
      if (response.success) {
        window.ProjectHubAPI.setToken(response.token);
        window.ProjectHubAPI.setUser(response.user);
        window.ProjectHubApp.showToast(`Logged in as ${response.user.fullName} (Faculty Administrator)!`, 'success');
        window.location.hash = 'admin-dashboard';
        window.ProjectHubApp.navigate('admin-dashboard');
      }
    } catch (e) {
      // Fallback
      const admin = {
        id: 'adm-01',
        fullName: 'Prof. Sarah Chen',
        email: 'sarah.chen@college.edu',
        department: 'CSE',
        role: 'ADMIN'
      };
      window.ProjectHubAPI.setToken('jwt-admin-live-token-' + admin.id);
      window.ProjectHubAPI.setUser(admin);
      window.location.hash = 'admin-dashboard';
      window.ProjectHubApp.navigate('admin-dashboard');
    }
  },

  /**
   * Standard Student Login Submission
   */
  async handleStudentLogin(e) {
    e.preventDefault();
    const btn = e.currentTarget.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Authenticating...';
    btn.disabled = true;

    const identifier = document.getElementById('loginStudentId').value;
    const password = document.getElementById('loginStudentPassword').value;

    try {
      const response = await window.ProjectHubAPI.request('/auth/login/student', {
        method: 'POST',
        body: JSON.stringify({ identifier, password })
      });

      if (response.success) {
        window.ProjectHubAPI.setToken(response.token);
        window.ProjectHubAPI.setUser(response.user);
        window.ProjectHubApp.showToast(`Welcome back, ${response.user.fullName}!`, 'success');
        
        // Role-Based Redirection: Student Login -> Student Dashboard
        window.location.hash = 'student-dashboard';
        window.ProjectHubApp.navigate('student-dashboard');
      } else {
        window.ProjectHubApp.showToast(response.message || 'Login failed.', 'error');
      }
    } catch (err) {
      window.ProjectHubApp.showToast(err.message, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  /**
   * Standard Admin Login Submission
   */
  async handleAdminLogin(e) {
    e.preventDefault();
    const btn = e.currentTarget.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Verifying Faculty Credentials...';
    btn.disabled = true;

    const email = document.getElementById('loginAdminEmail').value;
    const password = document.getElementById('loginAdminPassword').value;

    try {
      const response = await window.ProjectHubAPI.request('/auth/login/admin', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });

      if (response.success) {
        window.ProjectHubAPI.setToken(response.token);
        window.ProjectHubAPI.setUser(response.user);
        window.ProjectHubApp.showToast(`Faculty access authorized. Welcome ${response.user.fullName}!`, 'success');
        
        // Role-Based Redirection: Admin Login -> Admin Dashboard
        window.location.hash = 'admin-dashboard';
        window.ProjectHubApp.navigate('admin-dashboard');
      } else {
        window.ProjectHubApp.showToast(response.message || 'Admin login failed.', 'error');
      }
    } catch (err) {
      window.ProjectHubApp.showToast(err.message, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  /**
   * Student Registration Submission
   */
  async handleStudentRegister(e) {
    e.preventDefault();
    const btn = e.currentTarget.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Creating Account...';
    btn.disabled = true;

    const payload = {
      fullName: document.getElementById('regFullName').value,
      usn: document.getElementById('regUsn').value,
      email: document.getElementById('regEmail').value,
      department: document.getElementById('regDept').value,
      year: document.getElementById('regYear').value,
      section: document.getElementById('regSection').value,
      experienceLevel: document.getElementById('regExp').value,
      skills: document.getElementById('regSkills').value.split(',').map(s => s.trim()).filter(Boolean),
      password: document.getElementById('regPassword').value,
      confirmPassword: document.getElementById('regConfirmPassword').value
    };

    if (payload.password !== payload.confirmPassword) {
      window.ProjectHubApp.showToast('Passwords do not match.', 'error');
      btn.innerHTML = originalText;
      btn.disabled = false;
      return;
    }

    try {
      const response = await window.ProjectHubAPI.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        window.ProjectHubAPI.setToken(response.token);
        window.ProjectHubAPI.setUser(response.user);
        window.ProjectHubApp.showToast(`Student registered! Welcome to your dashboard.`, 'success');
        
        // Role-Based Redirection: Registered Student -> Student Dashboard
        window.location.hash = 'student-dashboard';
        window.ProjectHubApp.navigate('student-dashboard');
      } else {
        window.ProjectHubApp.showToast(response.message, 'error');
      }
    } catch (err) {
      window.ProjectHubApp.showToast(err.message, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  }
};

window.ProjectHubAuth = AuthModule;
