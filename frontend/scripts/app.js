/**
 * ============================================================================
 * PROJECTHUB AI - MASTER APPLICATION RUNTIME & ROUTER
 * Single Entry Point Router with Role-Based Redirection & Access Control
 * Real-Time Notification Center with Live Polling & Badge Counter
 * ============================================================================
 */

const App = {
  currentView: 'landing',
  pollingIntervalId: null,
  previousUnreadCount: 0,

  init() {
    this.initTheme();
    this.initCursorSpotlight();
    this.bindGlobalEvents();

    // Listen for hash changes (e.g. #landing, #student-dashboard, #admin-dashboard)
    window.addEventListener('hashchange', () => this.handleRouting());

    // Evaluate initial route on page load
    this.handleRouting();

    // Start background notification poller (every 3 seconds)
    this.startNotificationPoller();
  },

  /**
   * Smooth Fluid Cursor Spotlight Tracker
   * Illuminates glass cards under mouse movement like Stripe & Linear
   */
  initCursorSpotlight() {
    const spotlight = document.getElementById('cursorSpotlight');
    if (!spotlight) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isMoving = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        requestAnimationFrame(updateSpotlight);
      }
    }, { passive: true });

    function updateSpotlight() {
      currentX += (mouseX - currentX) * 0.12;
      currentY += (mouseY - currentY) * 0.12;

      spotlight.style.left = `${currentX}px`;
      spotlight.style.top = `${currentY}px`;

      if (Math.abs(mouseX - currentX) > 0.4 || Math.abs(mouseY - currentY) > 0.4) {
        requestAnimationFrame(updateSpotlight);
      } else {
        isMoving = false;
      }
    }
  },

  initTheme() {
    const savedTheme = localStorage.getItem('projecthub_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('projecthub_theme', next);
    this.showToast(`Switched to ${next} mode.`, 'info');
  },

  bindGlobalEvents() {
    const themeBtn = document.getElementById('btnToggleTheme');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Close notification panel when clicking outside
    document.addEventListener('click', (e) => {
      const wrap = document.getElementById('navNotificationWrap');
      const panel = document.getElementById('notificationPanel');
      if (wrap && panel && panel.style.display !== 'none') {
        if (!wrap.contains(e.target)) {
          panel.style.display = 'none';
        }
      }
    });
  },

  /**
   * Central Route Guard & Dispatcher
   */
  handleRouting() {
    const rawHash = (window.location.hash || '').replace(/^#\/?/, '').toLowerCase();
    const user = window.ProjectHubAPI.getUser();
    const token = window.ProjectHubAPI.getToken();
    const isAuthenticated = Boolean(token && user);

    // 1. Target: Admin Dashboard
    if (rawHash === 'admin-dashboard') {
      if (!isAuthenticated) {
        this.showToast('Please sign in as Faculty Administrator to access the Admin Dashboard.', 'error');
        this.navigate('landing', 'admin-login');
        return;
      }
      if (user.role !== 'ADMIN') {
        this.showToast('Access Denied: You are logged in as a Student. Admin privileges required.', 'error');
        this.navigate('student-dashboard');
        return;
      }
      this.navigate('admin-dashboard');
      return;
    }

    // 2. Target: Student Dashboard
    if (rawHash === 'student-dashboard') {
      if (!isAuthenticated) {
        this.showToast('Please sign in to access your Student Dashboard.', 'error');
        this.navigate('landing', 'student-login');
        return;
      }
      if (user.role === 'ADMIN') {
        this.showToast('Faculty accounts redirect to the Admin Dashboard.', 'info');
        this.navigate('admin-dashboard');
        return;
      }
      this.navigate('student-dashboard');
      return;
    }

    // Sub-route shortcut for team requests directly
    if (rawHash === 'team-requests') {
      if (!isAuthenticated) {
        this.navigate('landing', 'student-login');
        return;
      }
      this.navigate('student-dashboard');
      if (window.StudentDashboard && window.StudentDashboard.switchModule) {
        window.StudentDashboard.switchModule('team-requests');
      }
      return;
    }

    // Sub-route shortcut for my teams directly
    if (rawHash === 'my-teams') {
      if (!isAuthenticated) {
        this.navigate('landing', 'student-login');
        return;
      }
      this.navigate('student-dashboard');
      if (window.StudentDashboard && window.StudentDashboard.switchModule) {
        window.StudentDashboard.switchModule('my-teams');
      }
      return;
    }

    // 3. Target: Landing Sub-views (Student Login, Register, Admin Login)
    if (rawHash === 'login-student' || rawHash === 'student-login') {
      this.navigate('landing', 'student-login');
      return;
    }

    if (rawHash === 'login-admin' || rawHash === 'admin-login') {
      this.navigate('landing', 'admin-login');
      return;
    }

    if (rawHash === 'register' || rawHash === 'student-register') {
      this.navigate('landing', 'register');
      return;
    }

    // 4. Root / Default Entry Point (http://localhost:3000)
    if (isAuthenticated) {
      if (user.role === 'ADMIN') {
        this.navigate('admin-dashboard');
      } else {
        this.navigate('student-dashboard');
      }
    } else {
      this.navigate('landing', 'student-login');
    }
  },

  /**
   * Render View and update history / UI state
   */
  navigate(viewName, subView = null) {
    this.currentView = viewName;

    // Synchronize browser URL hash cleanly without infinite loops
    let expectedHash = viewName;
    if (viewName === 'landing' && subView) {
      if (subView === 'student-login') expectedHash = 'login-student';
      else if (subView === 'admin-login') expectedHash = 'login-admin';
      else if (subView === 'register') expectedHash = 'register';
    }

    if (window.location.hash.replace(/^#\/?/, '') !== expectedHash) {
      window.history.replaceState(null, null, `#${expectedHash}`);
    }

    // Toggle view containers
    document.querySelectorAll('.app-view').forEach(view => {
      view.style.display = 'none';
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.style.display = 'block';
      targetView.classList.add('animate-fade-in-up');
    }

    // Initialize context
    if (viewName === 'student-dashboard') {
      window.StudentDashboard.init();
      this.updateNavbarUser();
    } else if (viewName === 'admin-dashboard') {
      window.AdminDashboard.init();
      this.updateNavbarUser();
    } else if (viewName === 'landing') {
      window.ProjectHubAuth.init();
      if (subView) {
        window.ProjectHubAuth.switchAuthView(subView);
      }
      this.updateNavbarUser();
    }
  },

  /**
   * Navbar Brand Logo Navigation
   */
  handleLogoClick(e) {
    if (e) e.preventDefault();
    const user = window.ProjectHubAPI.getUser();
    if (user) {
      if (user.role === 'ADMIN') {
        window.location.hash = 'admin-dashboard';
      } else {
        window.location.hash = 'student-dashboard';
      }
    } else {
      window.location.hash = 'landing';
    }
  },

  /**
   * Universal Logout Action
   */
  logout() {
    window.ProjectHubAPI.logout();
    this.showToast('You have been logged out successfully.', 'info');
    window.location.hash = 'login-student';
    this.navigate('landing', 'student-login');
  },

  /**
   * Synchronize Navigation Header with Authentication State
   */
  updateNavbarUser() {
    const user = window.ProjectHubAPI.getUser();
    const token = window.ProjectHubAPI.getToken();
    const isAuthenticated = Boolean(token && user);

    const navGuestLinks = document.getElementById('navGuestLinks');
    const navUserBlock = document.getElementById('navUserBlock');
    const cohortBadge = document.getElementById('navCohortBadge');
    const navNotificationWrap = document.getElementById('navNotificationWrap');

    if (!isAuthenticated) {
      if (navGuestLinks) navGuestLinks.style.display = 'flex';
      if (navUserBlock) navUserBlock.style.display = 'none';
      if (cohortBadge) cohortBadge.style.display = 'none';
      if (navNotificationWrap) navNotificationWrap.style.display = 'none';
      return;
    }

    // Authenticated state
    if (navGuestLinks) navGuestLinks.style.display = 'none';
    if (navUserBlock) navUserBlock.style.display = 'flex';
    if (navNotificationWrap) navNotificationWrap.style.display = 'block';

    document.getElementById('navUserName').textContent = user.fullName;
    document.getElementById('navUserRole').textContent = 
      user.role === 'ADMIN' ? 'Faculty Admin' : `${user.department}-${user.year}-${user.section}`;

    if (user.avatarUrl && document.getElementById('navUserAvatar')) {
      document.getElementById('navUserAvatar').src = user.avatarUrl;
    }

    if (cohortBadge) {
      if (user.role === 'STUDENT') {
        cohortBadge.style.display = 'flex';
        cohortBadge.querySelector('span:last-child').textContent = `Cohort: ${user.department}-${user.year}-${user.section}`;
      } else {
        cohortBadge.style.display = 'none';
      }
    }

    const sidebarCohortLabel = document.getElementById('sidebarCohortLabel');
    if (sidebarCohortLabel && user.role === 'STUDENT') {
      sidebarCohortLabel.textContent = `${user.department} • Year ${user.year} • Sec ${user.section}`;
    }

    // Immediate notification refresh
    this.fetchNotifications();
  },

  // ==========================================================================
  // REAL-TIME NOTIFICATION SYSTEM
  // ==========================================================================
  startNotificationPoller() {
    if (this.pollingIntervalId) clearInterval(this.pollingIntervalId);
    this.pollingIntervalId = setInterval(() => {
      const user = window.ProjectHubAPI.getUser();
      if (user) {
        this.fetchNotifications();
      }
    }, 3000);
  },

  toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (!panel) return;

    if (panel.style.display === 'none' || panel.style.display === '') {
      panel.style.display = 'block';
      this.fetchNotifications();
    } else {
      panel.style.display = 'none';
    }
  },

  async markAllNotificationsRead() {
    try {
      await window.ProjectHubAPI.request('/notifications/read-all', { method: 'PUT' });
      const badge = document.getElementById('notificationBadge');
      if (badge) {
        badge.textContent = '0';
        badge.style.display = 'none';
      }
      this.showToast('All notifications marked as read.', 'info');
      await this.fetchNotifications();
    } catch (err) {
      console.warn('Error marking notifications as read:', err);
    }
  },

  async fetchNotifications() {
    const user = window.ProjectHubAPI.getUser();
    if (!user) return;

    try {
      const res = await window.ProjectHubAPI.request('/notifications');
      const notifications = res.notifications || [];
      const unreadCount = res.unreadCount || 0;

      // Update badge & trigger bell shake on new alerts
      const badge = document.getElementById('notificationBadge');
      const bellBtn = document.getElementById('btnNotificationBell');
      if (badge) {
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'flex' : 'none';
      }

      if (unreadCount > this.previousUnreadCount && bellBtn) {
        bellBtn.classList.remove('bell-ringing');
        void bellBtn.offsetWidth; // Trigger reflow
        bellBtn.classList.add('bell-ringing');
        setTimeout(() => bellBtn.classList.remove('bell-ringing'), 1000);
      }
      this.previousUnreadCount = unreadCount;

      // Render notification items
      const list = document.getElementById('notificationItemsList');
      if (!list) return;

      if (notifications.length === 0) {
        list.innerHTML = `
          <div style="padding: 2rem 1rem; text-align: center; color: var(--text-secondary); font-size: 0.84rem;">
            No notifications at this time
          </div>`;
        return;
      }

      list.innerHTML = notifications.map(n => {
        let icon = '🔔';
        if (n.type === 'INVITE_STUDENT') icon = '📩';
        else if (n.type === 'ACCEPTANCE') icon = '🚀';
        else if (n.type === 'DECLINE') icon = '⚠️';
        else if (n.type === 'SYSTEM') icon = '🎉';
        else if (n.type === 'QUERY_REPLY') icon = '💬';

        const unreadClass = n.isRead ? '' : 'is-unread';
        const safeLink = n.link || '#student-dashboard';

        return `
          <a class="notif-item ${unreadClass}" href="${safeLink}" onclick="window.ProjectHubApp.handleNotificationClick('${safeLink}')">
            <span class="notif-icon">${icon}</span>
            <div style="flex: 1; overflow: hidden;">
              <div class="notif-title">${n.title}</div>
              <div class="notif-text">${n.message}</div>
              <div class="notif-time">${new Date(n.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            ${!n.isRead ? '<span style="width: 8px; height: 8px; border-radius: 50%; background: #3B82F6; flex-shrink: 0; margin-top: 6px;"></span>' : ''}
          </a>
        `;
      }).join('');

    } catch (err) {
      console.warn('[Notifications] Error fetching updates:', err);
    }
  },

  handleNotificationClick(targetLink) {
    const panel = document.getElementById('notificationPanel');
    if (panel) panel.style.display = 'none';

    if (targetLink === '#team-requests') {
      if (window.StudentDashboard && window.StudentDashboard.switchModule) {
        window.StudentDashboard.switchModule('team-requests');
      }
    } else if (targetLink === '#my-teams') {
      if (window.StudentDashboard && window.StudentDashboard.switchModule) {
        window.StudentDashboard.switchModule('my-teams');
      }
    }
  },

  /**
   * Toast Notification Dispatcher
   */
  showToast(message, type = 'info') {
    const rack = document.getElementById('toastRack');
    if (!rack) return;

    const toast = document.createElement('div');
    toast.className = `toast-msg animate-fade-in-up`;
    toast.style.borderColor = 
      type === 'success' ? '#10B981' : 
      (type === 'error' ? '#F43F5E' : 'rgba(255,255,255,0.15)');

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    rack.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }
};

window.ProjectHubApp = App;

document.addEventListener('DOMContentLoaded', () => {
  window.ProjectHubApp.init();
});
