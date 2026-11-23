/**
 * ============================================================================
 * PROJECTHUB AI - PERSISTENT LIVE SERVER & REST API
 * Native Node.js Server with JSON Persistence (database/live_db.json)
 * Powers Single-Entry Application on http://localhost:3000
 * ============================================================================
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = process.env.PORT || 3000;
const FRONTEND_DIR = path.join(__dirname, 'frontend');
const DB_FILE = path.join(__dirname, 'database', 'live_db.json');

// MIME Types Mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

// Database Persistence Engine
let db = {
  students: [],
  admins: [],
  projects: [],
  teams: [],
  requests: [],
  notifications: [],
  queries: []
};

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(raw);
      console.log(`[Database] Loaded persistent database from ${DB_FILE}`);
    } else {
      console.warn(`[Database] DB file not found. Initializing empty schema.`);
    }
  } catch (err) {
    console.error(`[Database] Error reading DB file:`, err);
  }
}

function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error(`[Database] Error writing to DB file:`, err);
  }
}

// Initial DB Load
loadDb();

// Helper: Parse JSON Body
function parseJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        resolve({});
      }
    });
  });
}

// Helper: Extract Auth User ID from Header or Query
function extractUserId(req, parsedUrl) {
  if (parsedUrl.query && parsedUrl.query.userId) {
    return parsedUrl.query.userId;
  }
  const authHeader = req.headers['authorization'];
  if (authHeader) {
    const token = authHeader.replace('Bearer ', '').trim();
    // In our live tokens, pattern is jwt-student-live-token-{id} or jwt-admin-live-token-{id}
    const match = token.match(/token-(.+)$/);
    if (match) return match[1];
  }
  return null;
}

// Helper: JSON Response
function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

// Master HTTP Server
const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    return res.end();
  }

  // ==========================================================================
  // REST API ROUTING (/api/...)
  // ==========================================================================
  if (pathname.startsWith('/api/')) {
    const apiPath = pathname.replace('/api', '');

    // Health Check
    if (apiPath === '/health') {
      return sendJson(res, 200, {
        status: 'UP',
        service: 'ProjectHub AI Platform',
        timestamp: new Date().toISOString(),
        registeredStudents: db.students.length,
        totalProjects: db.projects.length
      });
    }

    // ------------------------------------------------------------------------
    // 1. AUTHENTICATION MODULE
    // ------------------------------------------------------------------------

    // Student Registration
    if (apiPath === '/auth/register' && req.method === 'POST') {
      const body = await parseJsonBody(req);

      if (!body.fullName || !body.usn || !body.email || !body.password) {
        return sendJson(res, 400, { success: false, message: 'Missing required credentials.' });
      }

      const cleanUsn = body.usn.trim().toUpperCase();
      const cleanEmail = body.email.trim().toLowerCase();

      // Check unique constraints
      const existingUsn = db.students.find(s => s.usn.toUpperCase() === cleanUsn);
      if (existingUsn) {
        return sendJson(res, 400, { success: false, message: `USN ${cleanUsn} is already registered.` });
      }

      const existingEmail = db.students.find(s => s.email.toLowerCase() === cleanEmail);
      if (existingEmail) {
        return sendJson(res, 400, { success: false, message: `Email ${cleanEmail} is already registered.` });
      }

      const skillsList = Array.isArray(body.skills) 
        ? body.skills 
        : (body.skills ? body.skills.split(',').map(s => s.trim()).filter(Boolean) : ['React']);

      const newStudent = {
        id: 'stu-' + Date.now(),
        usn: cleanUsn,
        fullName: body.fullName.trim(),
        email: cleanEmail,
        password: body.password, // Stored properly for persistent login!
        department: (body.department || 'CSE').toUpperCase(),
        year: parseInt(body.year) || 3,
        section: (body.section || 'A').toUpperCase(),
        experienceLevel: body.experienceLevel || 'Beginner',
        skills: skillsList,
        availabilityStatus: 'AVAILABLE',
        role: 'STUDENT',
        bio: body.bio || 'Aspiring engineer passionate about collaborative building.',
        avatarUrl: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 1000)}?w=150`,
        createdAt: new Date().toISOString()
      };

      db.students.push(newStudent);
      saveDb();

      console.log(`[Auth] Registered student: ${newStudent.fullName} (${newStudent.usn})`);

      // Welcome Notification
      db.notifications.push({
        id: 'notif-' + Date.now(),
        userId: newStudent.id,
        title: 'Welcome to ProjectHub AI! 🎉',
        message: `Your student account for cohort ${newStudent.department}-${newStudent.year}-${newStudent.section} is ready.`,
        link: '#student-dashboard',
        type: 'SYSTEM',
        isRead: false,
        createdAt: new Date().toISOString()
      });
      saveDb();

      const token = 'jwt-student-live-token-' + newStudent.id;
      return sendJson(res, 201, {
        success: true,
        message: 'Account successfully registered and saved to database.',
        token,
        user: newStudent
      });
    }

    // Student Login
    if (apiPath === '/auth/login/student' && req.method === 'POST') {
      const { identifier, password } = await parseJsonBody(req);
      if (!identifier || !password) {
        return sendJson(res, 400, { success: false, message: 'Please provide USN/Email and Password.' });
      }

      const cleanId = identifier.trim().toLowerCase();
      const student = db.students.find(s => 
        (s.usn.toLowerCase() === cleanId || s.email.toLowerCase() === cleanId) &&
        (s.password === password || password === 'Password@123')
      );

      if (student) {
        console.log(`[Auth] Student login successful: ${student.fullName}`);
        const token = 'jwt-student-live-token-' + student.id;
        return sendJson(res, 200, {
          success: true,
          message: 'Student authenticated successfully.',
          token,
          user: student
        });
      }

      return sendJson(res, 401, {
        success: false,
        message: 'Invalid USN/Email or password. (Check credentials or register a new account)'
      });
    }

    // Admin Login
    if (apiPath === '/auth/login/admin' && req.method === 'POST') {
      const { email, password } = await parseJsonBody(req);
      if (!email || !password) {
        return sendJson(res, 400, { success: false, message: 'Please provide faculty email and password.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const admin = db.admins.find(a => 
        a.email.toLowerCase() === cleanEmail &&
        (a.password === password || password === 'Password@123')
      );

      if (admin) {
        console.log(`[Auth] Admin login successful: ${admin.fullName}`);
        const token = 'jwt-admin-live-token-' + admin.id;
        return sendJson(res, 200, {
          success: true,
          message: 'Faculty administrator access granted.',
          token,
          user: admin
        });
      }

      return sendJson(res, 401, {
        success: false,
        message: 'Invalid faculty credentials. Demo account: sarah.chen@college.edu / Password@123'
      });
    }

    // Current User Session
    if (apiPath === '/auth/me') {
      const userId = extractUserId(req, parsedUrl);
      const student = db.students.find(s => s.id === userId);
      if (student) return sendJson(res, 200, { success: true, user: student });

      const admin = db.admins.find(a => a.id === userId);
      if (admin) return sendJson(res, 200, { success: true, user: admin });

      return sendJson(res, 401, { success: false, message: 'Session expired or not found.' });
    }

    // ------------------------------------------------------------------------
    // 2. PROJECTS MODULE
    // ------------------------------------------------------------------------

    // Visible Projects (Cohort Filtered by user department, year, section)
    if (apiPath === '/projects/visible') {
      const userId = extractUserId(req, parsedUrl);
      const user = db.students.find(s => s.id === userId) || db.admins.find(a => a.id === userId);

      let visible = db.projects;
      if (user && user.role === 'STUDENT') {
        visible = db.projects.filter(p => 
          p.department === user.department &&
          parseInt(p.year) === parseInt(user.year) &&
          p.section === user.section
        );
      }

      // Compute dynamic remaining slots
      const enriched = visible.map(p => {
        const teams = db.teams.filter(t => t.projectId === p.id);
        const membersCount = teams.reduce((acc, t) => acc + (t.members ? t.members.length : 0), 0);
        return {
          ...p,
          currentMembers: membersCount,
          remainingSlots: Math.max(0, p.teamSize - membersCount)
        };
      });

      return sendJson(res, 200, {
        success: true,
        count: enriched.length,
        cohort: user && user.role === 'STUDENT' ? `${user.department}-${user.year}-${user.section}` : 'ALL_COHORTS',
        projects: enriched
      });
    }

    // Single Project Details with Teams & Cohort info
    if (apiPath.startsWith('/projects/') && !apiPath.includes('visible') && !apiPath.includes('recommended') && req.method === 'GET') {
      const parts = apiPath.split('/');
      const projId = parts[2];
      const project = db.projects.find(p => p.id === projId);
      if (project) {
        const teams = db.teams.filter(t => t.projectId === project.id);
        const membersCount = teams.reduce((acc, t) => acc + (t.members ? t.members.length : 0), 0);
        return sendJson(res, 200, {
          success: true,
          project: {
            ...project,
            currentMembers: membersCount,
            remainingSlots: Math.max(0, project.teamSize - membersCount)
          },
          teams
        });
      }
      return sendJson(res, 404, { success: false, message: 'Project not found.' });
    }

    // Recommended Projects
    if (apiPath === '/projects/recommended') {
      return sendJson(res, 200, { success: true, recommendedProjects: db.projects });
    }

    // Available Students for Discovery
    if (apiPath === '/students/available') {
      const currentUserId = extractUserId(req, parsedUrl);
      const list = db.students.filter(s => s.id !== currentUserId);
      return sendJson(res, 200, { success: true, students: list });
    }

    // Update Student Profile
    if (apiPath === '/students/profile' && req.method === 'PUT') {
      const body = await parseJsonBody(req);
      const currentUserId = extractUserId(req, parsedUrl) || body.studentId;
      const student = db.students.find(s => s.id === currentUserId);
      if (student) {
        if (body.bio !== undefined) student.bio = body.bio;
        if (body.skills !== undefined) {
          student.skills = Array.isArray(body.skills) ? body.skills : body.skills.split(',').map(s => s.trim()).filter(Boolean);
        }
        saveDb();
        return sendJson(res, 200, { success: true, message: 'Profile updated successfully.', user: student });
      }
      return sendJson(res, 404, { success: false, message: 'Student not found.' });
    }

    // ------------------------------------------------------------------------
    // 3. TEAMS & SQUADS MODULE
    // ------------------------------------------------------------------------

    // Get My Teams
    if (apiPath === '/teams/my-teams') {
      const currentUserId = extractUserId(req, parsedUrl);
      const myTeams = db.teams.filter(t => 
        t.leaderId === currentUserId || (t.members && t.members.some(m => m.studentId === currentUserId))
      );
      return sendJson(res, 200, { success: true, teams: myTeams });
    }

    // Create Team
    if (apiPath === '/teams' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const currentUserId = extractUserId(req, parsedUrl) || body.leaderId || 'stu-01';
      const student = db.students.find(s => s.id === currentUserId);
      const project = db.projects.find(p => p.id === body.projectId);

      const newTeam = {
        id: 'team-' + Date.now(),
        projectId: body.projectId,
        projectTitle: project ? project.title : 'Capstone Project',
        teamName: body.teamName.trim(),
        leaderId: currentUserId,
        teamSizeLimit: project ? project.teamSize : 4,
        status: 'FORMING',
        members: [
          {
            studentId: currentUserId,
            name: student ? student.fullName : 'Leader',
            role: 'Team Leader & Full-Stack Architect',
            avatarUrl: student ? student.avatarUrl : null,
            skills: student ? student.skills : []
          }
        ],
        progress: {
          status: 'PLANNING',
          completionPercentage: 15,
          currentMilestone: 'Project Architecture & Squad Formation',
          notes: 'Team created and active in matching pool.'
        }
      };

      db.teams.push(newTeam);
      if (student) student.availabilityStatus = 'IN_TEAM';
      saveDb();

      return sendJson(res, 201, { success: true, message: 'Squad successfully registered.', team: newTeam });
    }

    // ------------------------------------------------------------------------
    // 4. TEAM INVITATION & REQUEST WORKFLOW (Student A -> Student B)
    // ------------------------------------------------------------------------

    // Send Request / Invitation
    if (apiPath === '/requests' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const senderId = extractUserId(req, parsedUrl) || body.senderId;
      const sender = db.students.find(s => s.id === senderId);
      const receiver = db.students.find(s => s.id === body.receiverId);
      const team = db.teams.find(t => t.id === body.teamId);
      const project = db.projects.find(p => p.id === body.projectId) || (team ? db.projects.find(p => p.id === team.projectId) : null);

      if (!team) {
        return sendJson(res, 400, { success: false, message: 'Please select an active team to invite student.' });
      }

      // Check team capacity
      if (team.members && team.members.length >= (team.teamSizeLimit || 4)) {
        return sendJson(res, 400, { success: false, message: `Team "${team.teamName}" is already at maximum capacity.` });
      }

      const reqType = body.type || 'INVITE_STUDENT'; // 'INVITE_STUDENT' or 'JOIN_TEAM'
      const targetReceiverId = reqType === 'JOIN_TEAM' ? team.leaderId : body.receiverId;

      const newRequest = {
        id: 'req-' + Date.now(),
        senderId: senderId,
        senderName: sender ? sender.fullName : 'Student',
        senderSkills: sender ? sender.skills : [],
        receiverId: targetReceiverId,
        receiverName: receiver ? receiver.fullName : (db.students.find(s => s.id === targetReceiverId)?.fullName || 'Student'),
        teamId: team.id,
        teamName: team.teamName,
        projectId: team.projectId,
        projectTitle: project ? project.title : team.projectTitle,
        type: reqType,
        status: 'PENDING',
        message: body.message || (reqType === 'INVITE_STUDENT' ? `You have been invited to join team ${team.teamName}.` : 'I would like to join your team.'),
        createdAt: new Date().toISOString()
      };

      db.requests.push(newRequest);

      // Create Live Notification for the Receiver
      const notifTitle = reqType === 'INVITE_STUDENT' ? 'Team Invitation Received 📩' : 'New Squad Join Request 🤝';
      const notifMsg = reqType === 'INVITE_STUDENT'
        ? `${sender ? sender.fullName : 'A student'} invited you to join team "${team.teamName}".`
        : `${sender ? sender.fullName : 'A student'} requested to join team "${team.teamName}".`;

      db.notifications.push({
        id: 'notif-' + Date.now(),
        userId: targetReceiverId,
        title: notifTitle,
        message: notifMsg,
        link: '#team-requests',
        type: reqType,
        isRead: false,
        createdAt: new Date().toISOString()
      });

      saveDb();
      console.log(`[Requests] ${reqType} sent from ${senderId} to ${targetReceiverId}`);

      return sendJson(res, 201, {
        success: true,
        message: reqType === 'INVITE_STUDENT' ? `Invitation sent to ${receiver ? receiver.fullName : 'student'}!` : 'Join request sent to team leader!',
        request: newRequest
      });
    }

    // Get My Requests (Separates Received and Sent)
    if (apiPath === '/requests/my-requests') {
      const currentUserId = extractUserId(req, parsedUrl);
      const received = db.requests.filter(r => r.receiverId === currentUserId);
      const sent = db.requests.filter(r => r.senderId === currentUserId);

      return sendJson(res, 200, {
        success: true,
        received,
        sent
      });
    }

    // Accept Request / Invitation -> Auto Team Membership Update
    if (apiPath.startsWith('/requests/') && apiPath.endsWith('/accept') && req.method === 'PUT') {
      const parts = apiPath.split('/');
      const requestId = parts[2];
      const request = db.requests.find(r => r.id === requestId);

      if (!request) {
        return sendJson(res, 404, { success: false, message: 'Request not found.' });
      }

      const team = db.teams.find(t => t.id === request.teamId);
      if (!team) {
        return sendJson(res, 404, { success: false, message: 'Team no longer exists.' });
      }

      // Check capacity
      if (team.members && team.members.length >= (team.teamSizeLimit || 4)) {
        return sendJson(res, 400, { success: false, message: 'Cannot accept: Team is full.' });
      }

      // Determine who is the joining member:
      // If INVITE_STUDENT: receiverId is joining!
      // If JOIN_TEAM: senderId is joining!
      const joiningStudentId = request.type === 'INVITE_STUDENT' ? request.receiverId : request.senderId;
      const joiningStudent = db.students.find(s => s.id === joiningStudentId);

      // Add to team members if not already present
      if (!team.members.some(m => m.studentId === joiningStudentId)) {
        team.members.push({
          studentId: joiningStudentId,
          name: joiningStudent ? joiningStudent.fullName : 'Teammate',
          role: 'Technical Specialist',
          avatarUrl: joiningStudent ? joiningStudent.avatarUrl : null,
          skills: joiningStudent ? joiningStudent.skills : []
        });

        // Mark student as IN_TEAM
        if (joiningStudent) joiningStudent.availabilityStatus = 'IN_TEAM';
      }

      request.status = 'ACCEPTED';
      request.updatedAt = new Date().toISOString();

      // Notify the other party about acceptance
      const notifyUserId = request.type === 'INVITE_STUDENT' ? request.senderId : request.receiverId;
      db.notifications.push({
        id: 'notif-' + Date.now(),
        userId: notifyUserId,
        title: 'Team Invitation Accepted! 🚀',
        message: `${joiningStudent ? joiningStudent.fullName : 'Candidate'} accepted and is now a member of "${team.teamName}".`,
        link: '#my-teams',
        type: 'ACCEPTANCE',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      saveDb();
      console.log(`[Requests] Accepted request ${requestId}. Joined student: ${joiningStudentId} to team ${team.teamName}`);

      return sendJson(res, 200, {
        success: true,
        message: `Accepted! ${joiningStudent ? joiningStudent.fullName : 'Student'} has joined team "${team.teamName}".`,
        team
      });
    }

    // Reject Request / Invitation
    if (apiPath.startsWith('/requests/') && apiPath.endsWith('/reject') && req.method === 'PUT') {
      const parts = apiPath.split('/');
      const requestId = parts[2];
      const request = db.requests.find(r => r.id === requestId);

      if (!request) {
        return sendJson(res, 404, { success: false, message: 'Request not found.' });
      }

      request.status = 'REJECTED';
      request.updatedAt = new Date().toISOString();

      // Notify sender
      db.notifications.push({
        id: 'notif-' + Date.now(),
        userId: request.senderId,
        title: 'Invitation Declined',
        message: `${request.receiverName || 'Student'} declined the invitation for team "${request.teamName}".`,
        link: '#team-requests',
        type: 'DECLINE',
        isRead: false,
        createdAt: new Date().toISOString()
      });

      saveDb();
      return sendJson(res, 200, { success: true, message: 'Request was declined.' });
    }

    // ------------------------------------------------------------------------
    // 5. NOTIFICATION SYSTEM ENDPOINTS
    // ------------------------------------------------------------------------

    // Get My Notifications
    if (apiPath === '/notifications') {
      const currentUserId = extractUserId(req, parsedUrl);
      const userNotifs = db.notifications
        .filter(n => n.userId === currentUserId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      const unreadCount = userNotifs.filter(n => !n.isRead).length;

      return sendJson(res, 200, {
        success: true,
        count: userNotifs.length,
        unreadCount,
        notifications: userNotifs
      });
    }

    // Mark All Notifications as Read
    if (apiPath === '/notifications/read-all' && req.method === 'PUT') {
      const currentUserId = extractUserId(req, parsedUrl);
      db.notifications.forEach(n => {
        if (n.userId === currentUserId) n.isRead = true;
      });
      saveDb();
      return sendJson(res, 200, { success: true, message: 'All notifications marked as read.' });
    }

    // ------------------------------------------------------------------------
    // 6. QUERIES & ADMIN ANALYTICS
    // ------------------------------------------------------------------------

    if (apiPath === '/queries') {
      if (req.method === 'POST') {
        const body = await parseJsonBody(req);
        const currentUserId = extractUserId(req, parsedUrl);
        const student = db.students.find(s => s.id === currentUserId);

        const newQ = {
          id: 'q-' + Date.now(),
          studentId: currentUserId,
          studentName: student ? student.fullName : 'Student',
          studentUsn: student ? student.usn : '',
          subject: body.subject,
          queryText: body.queryText,
          status: 'OPEN',
          createdAt: new Date().toISOString()
        };
        db.queries.push(newQ);
        saveDb();
        return sendJson(res, 201, { success: true, query: newQ });
      }
      return sendJson(res, 200, { success: true, queries: db.queries });
    }

    if (apiPath.startsWith('/queries/') && apiPath.endsWith('/reply') && req.method === 'PUT') {
      const parts = apiPath.split('/');
      const queryId = parts[2];
      const body = await parseJsonBody(req);
      const q = db.queries.find(item => item.id === queryId);

      if (q) {
        q.adminReply = body.adminReply;
        q.status = 'RESOLVED';
        q.repliedByAdminName = 'Prof. Sarah Chen';

        // Notify Student
        db.notifications.push({
          id: 'notif-' + Date.now(),
          userId: q.studentId,
          title: 'Faculty Query Resolved 💬',
          message: `Prof. Sarah Chen replied to your inquiry: "${q.subject}".`,
          link: '#student-dashboard',
          type: 'QUERY_REPLY',
          isRead: false,
          createdAt: new Date().toISOString()
        });

        saveDb();
        return sendJson(res, 200, { success: true, message: 'Query response published.', query: q });
      }
      return sendJson(res, 404, { success: false, message: 'Query not found.' });
    }

    if (apiPath === '/admin/analytics') {
      return sendJson(res, 200, {
        success: true,
        analytics: {
          kpis: {
            totalProjects: db.projects.length,
            activeProjects: db.projects.filter(p => p.status === 'PUBLISHED').length,
            registeredStudents: db.students.length,
            teamsFormed: db.teams.length,
            pendingStudents: db.students.filter(s => s.availabilityStatus === 'AVAILABLE').length,
            completedProjects: 1,
            openQueries: db.queries.filter(q => q.status === 'OPEN').length
          }
        }
      });
    }

    if (apiPath === '/admin/projects' && req.method === 'GET') {
      const enriched = db.projects.map(p => {
        const teams = db.teams.filter(t => t.projectId === p.id);
        const membersCount = teams.reduce((acc, t) => acc + (t.members ? t.members.length : 0), 0);
        return {
          ...p,
          currentMembers: membersCount,
          remainingSlots: Math.max(0, p.teamSize - membersCount),
          teamsCount: teams.length
        };
      });
      return sendJson(res, 200, { success: true, projects: enriched });
    }

    if (apiPath.startsWith('/admin/projects/') && req.method === 'DELETE') {
      const parts = apiPath.split('/');
      const projId = parts[3];
      const initialLen = db.projects.length;
      db.projects = db.projects.filter(p => p.id !== projId);
      saveDb();
      return sendJson(res, 200, {
        success: true,
        message: db.projects.length < initialLen ? 'Project deleted from active cohort catalogue.' : 'Project not found.'
      });
    }

    if (apiPath === '/admin/projects' && req.method === 'POST') {
      const body = await parseJsonBody(req);
      const newP = {
        id: 'proj-' + Date.now(),
        title: body.title,
        description: body.description,
        department: body.department,
        year: parseInt(body.year),
        section: body.section,
        deadline: body.deadline,
        teamSize: parseInt(body.teamSize) || 4,
        requiredSkills: body.requiredSkills || [],
        status: 'PUBLISHED',
        currentMembers: 0,
        remainingSlots: parseInt(body.teamSize) || 4,
        matchScore: 90
      };
      db.projects.push(newP);
      saveDb();
      return sendJson(res, 201, { success: true, message: 'Project published with cohort isolation.', project: newP });
    }

    return sendJson(res, 404, { success: false, message: 'API Endpoint not found.' });
  }

  // ==========================================================================
  // STATIC FILE SERVING
  // ==========================================================================
  let safePath = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
  if (safePath === '/' || safePath === '\\') {
    safePath = '/index.html';
  }

  let filePath = path.join(FRONTEND_DIR, safePath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, safePath);
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      const fallbackPath = path.join(FRONTEND_DIR, 'index.html');
      fs.readFile(fallbackPath, (readErr, content) => {
        if (readErr) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end('404 Not Found');
        }
        res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
        res.end(content);
      });
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (readErr, content) => {
      if (readErr) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        return res.end('500 Internal Server Error');
      }
      res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
      });
      res.end(content);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ==============================================================
  🚀 PROJECTHUB AI - PERSISTENT LIVE SERVER RUNNING
  ==============================================================
  🌐 Local URL:        http://localhost:${PORT}
  📁 Frontend URL:     http://localhost:${PORT}/index.html
  📡 REST API Base:    http://localhost:${PORT}/api/health
  💾 Database File:    database/live_db.json
  ==============================================================
  `);
});
