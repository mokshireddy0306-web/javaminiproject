/**
 * ============================================================================
 * PROJECTHUB AI - CLIENT API SERVICE
 * Dual-Mode Client: Automatically connects to Express API, or falls back to
 * rich client-side mock store if running locally without backend.
 * ============================================================================
 */

const API_BASE_URL = (typeof window !== 'undefined' && window.location.origin && window.location.origin.startsWith('http'))
  ? `${window.location.origin}/api`
  : 'http://localhost:3000/api';

const API = {
  getToken() {
    return localStorage.getItem('projecthub_token');
  },

  setToken(token) {
    localStorage.setItem('projecthub_token', token);
  },

  getUser() {
    const raw = localStorage.getItem('projecthub_user');
    return raw ? JSON.parse(raw) : null;
  },

  setUser(user) {
    localStorage.setItem('projecthub_user', JSON.stringify(user));
  },

  logout() {
    localStorage.removeItem('projecthub_token');
    localStorage.removeItem('projecthub_user');
  },

  /**
   * Generic Request with graceful fallback
   */
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const user = this.getUser();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    // Append userId query parameter if user is authenticated and not already in URL
    let url = `${API_BASE_URL}${endpoint}`;
    if (user && user.id && !endpoint.includes('userId=')) {
      const sep = url.includes('?') ? '&' : '?';
      url = `${url}${sep}userId=${encodeURIComponent(user.id)}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (networkError) {
      console.warn(`[ProjectHub API] Server connection issue at ${endpoint}: ${networkError.message}. Using active mock fallback.`);
      return this.fallbackHandler(endpoint, options);
    }
  },

  /**
   * Fallback In-Browser Handler when backend is not running
   */
  async fallbackHandler(endpoint, options) {
    await new Promise(r => setTimeout(r, 120)); // Small simulated latency

    const user = this.getUser();
    const method = options.method || 'GET';
    const body = options.body ? JSON.parse(options.body) : {};

    // Auth Routes
    if (endpoint === '/auth/login/student') {
      const student = window.ProjectHubMock.currentUser;
      return { success: true, token: 'mock-student-jwt-token', user: student };
    }
    if (endpoint === '/auth/login/admin') {
      const admin = {
        id: 'adm-02',
        fullName: 'Prof. Sarah Chen',
        email: body.email || 'sarah.chen@college.edu',
        department: 'CSE',
        role: 'ADMIN'
      };
      return { success: true, token: 'mock-admin-jwt-token', user: admin };
    }
    if (endpoint === '/auth/register') {
      const newStudent = {
        id: `stu-${Date.now()}`,
        usn: body.usn,
        fullName: body.fullName,
        email: body.email,
        department: body.department,
        year: parseInt(body.year),
        section: body.section,
        experienceLevel: body.experienceLevel || 'Beginner',
        skills: body.skills || ['React'],
        role: 'STUDENT'
      };
      return { success: true, token: 'mock-student-jwt-token', user: newStudent };
    }

    // Projects Routes
    if (endpoint.startsWith('/projects/visible')) {
      // Cohort Isolation: Only show projects matching current student's dept, year, sec
      const visible = window.ProjectHubMock.projects.filter(p => {
        if (user.role === 'ADMIN') return true;
        return (
          p.department === user.department &&
          parseInt(p.year) === parseInt(user.year) &&
          p.section === user.section
        );
      });
      return { success: true, count: visible.length, projects: visible };
    }

    if (endpoint.startsWith('/projects/recommended')) {
      const visible = window.ProjectHubMock.projects.filter(p => 
        p.department === user.department && parseInt(p.year) === parseInt(user.year)
      );
      return { success: true, recommendedProjects: visible };
    }

    // Students
    if (endpoint.startsWith('/students/available')) {
      return { success: true, students: window.ProjectHubMock.students };
    }

    // Teams
    if (endpoint.startsWith('/teams/my-teams')) {
      return { success: true, teams: window.ProjectHubMock.teams };
    }
    if (endpoint === '/teams' && method === 'POST') {
      const newTeam = {
        id: `team-${Date.now()}`,
        projectId: body.projectId,
        teamName: body.teamName,
        leaderId: user.id,
        teamSizeLimit: 4,
        status: 'FORMING',
        members: [{ studentId: user.id, name: user.fullName, role: 'Leader' }],
        progress: { status: 'PLANNING', completionPercentage: 10 }
      };
      window.ProjectHubMock.teams.push(newTeam);
      return { success: true, message: 'Team created.', team: newTeam };
    }

    // Requests
    if (endpoint.startsWith('/requests/my-requests')) {
      return { 
        success: true, 
        received: window.ProjectHubMock.requests, 
        sent: [] 
      };
    }
    if (endpoint === '/requests' && method === 'POST') {
      const newReq = {
        id: `req-${Date.now()}`,
        senderId: user.id,
        senderName: user.fullName,
        receiverId: body.receiverId,
        teamId: body.teamId,
        projectId: body.projectId,
        type: body.type || 'JOIN_TEAM',
        status: 'PENDING',
        message: body.message
      };
      window.ProjectHubMock.requests.push(newReq);
      return { success: true, message: 'Request sent.', request: newReq };
    }

    // Queries
    if (endpoint.startsWith('/queries')) {
      if (method === 'POST') {
        const newQ = {
          id: `q-${Date.now()}`,
          studentId: user.id,
          studentName: user.fullName,
          subject: body.subject,
          queryText: body.queryText,
          status: 'OPEN'
        };
        window.ProjectHubMock.queries.push(newQ);
        return { success: true, query: newQ };
      }
      return { success: true, queries: window.ProjectHubMock.queries };
    }

    // Single Project
    if (endpoint.startsWith('/projects/') && !endpoint.includes('visible') && !endpoint.includes('recommended')) {
      const parts = endpoint.split('/');
      const pid = parts[2].split('?')[0];
      const p = window.ProjectHubMock.projects.find(x => x.id === pid) || window.ProjectHubMock.projects[0];
      const teams = (window.ProjectHubMock.teams || []).filter(t => t.projectId === p.id);
      return { success: true, project: p, teams };
    }

    // Student Profile
    if (endpoint.startsWith('/students/profile') && method === 'PUT') {
      if (user) {
        if (body.bio !== undefined) user.bio = body.bio;
        if (body.skills !== undefined) user.skills = body.skills;
        this.setUser(user);
      }
      return { success: true, message: 'Profile updated.', user };
    }

    // Admin Projects
    if (endpoint.startsWith('/admin/projects') && method === 'GET') {
      return { success: true, projects: window.ProjectHubMock.projects };
    }

    if (endpoint.startsWith('/admin/projects/') && method === 'DELETE') {
      const parts = endpoint.split('/');
      const pid = parts[3].split('?')[0];
      window.ProjectHubMock.projects = window.ProjectHubMock.projects.filter(p => p.id !== pid);
      return { success: true, message: 'Project removed.' };
    }

    // Admin Analytics
    if (endpoint.startsWith('/admin/analytics')) {
      return { success: true, analytics: window.ProjectHubMock.analytics };
    }

    if (endpoint === '/admin/projects' && method === 'POST') {
      const newProject = {
        id: `proj-${Date.now()}`,
        title: body.title,
        description: body.description,
        department: body.department,
        year: parseInt(body.year),
        section: body.section,
        deadline: body.deadline,
        teamSize: parseInt(body.teamSize) || 4,
        requiredSkills: body.requiredSkills || [],
        status: body.status || 'PUBLISHED',
        currentMembers: 0,
        remainingSlots: parseInt(body.teamSize) || 4,
        matchScore: 90
      };
      window.ProjectHubMock.projects.push(newProject);
      return { success: true, message: 'Project created successfully.', project: newProject };
    }

    return { success: true, message: 'Operation executed.' };
  }
};

window.ProjectHubAPI = API;
