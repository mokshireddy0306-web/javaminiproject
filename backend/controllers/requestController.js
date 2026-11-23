/**
 * ============================================================================
 * PROJECTHUB AI - REQUEST CONTROLLER
 * Handles sending team invitations, join requests, approvals, and rejections.
 * ============================================================================
 */

const { memoryStore, uuidv4 } = require('../config/db');

/**
 * Send a Team Request (Join Team or Invite Student)
 */
const sendRequest = (req, res) => {
  try {
    const senderId = req.user.id;
    const { receiverId, teamId, projectId, type, message } = req.body;

    if (!teamId || !projectId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Team ID, Project ID, and Request Type are required.'
      });
    }

    const team = memoryStore.teams.find(t => t.id === teamId);
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found.' });
    }

    const project = memoryStore.projects.find(p => p.id === projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found.' });
    }

    // Check if team is full
    if (team.members.length >= project.teamSize) {
      return res.status(400).json({
        success: false,
        message: `Team "${team.teamName}" is already at maximum capacity (${project.teamSize} members).`
      });
    }

    // Duplicate check
    const existingPending = memoryStore.requests.find(r => 
      r.teamId === teamId &&
      r.senderId === senderId &&
      (receiverId ? r.receiverId === receiverId : true) &&
      r.status === 'PENDING'
    );
    if (existingPending) {
      return res.status(400).json({
        success: false,
        message: 'A pending request has already been sent for this team.'
      });
    }

    // For JOIN_TEAM, the receiver is the team leader
    const targetReceiverId = type === 'JOIN_TEAM' ? team.leaderId : receiverId;

    const newRequest = {
      id: `req-${uuidv4().substring(0, 8)}`,
      senderId,
      receiverId: targetReceiverId,
      teamId,
      projectId,
      type, // 'JOIN_TEAM' or 'INVITE_STUDENT'
      status: 'PENDING',
      message: message || (type === 'JOIN_TEAM' ? 'I would like to join your project team.' : 'You have been invited to join our team.'),
      createdAt: new Date().toISOString()
    };

    memoryStore.requests.push(newRequest);

    // Create Notification
    memoryStore.notifications.push({
      id: `notif-${uuidv4().substring(0, 8)}`,
      userId: targetReceiverId,
      userType: 'STUDENT',
      title: type === 'JOIN_TEAM' ? 'New Join Request' : 'New Team Invitation',
      message: `${req.user.fullName} sent a request for team "${team.teamName}".`,
      link: '/requests',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.status(201).json({
      success: true,
      message: type === 'JOIN_TEAM' ? 'Join request sent to team leader.' : 'Team invitation sent to student.',
      request: newRequest
    });
  } catch (error) {
    console.error('Error sending request:', error);
    return res.status(500).json({ success: false, message: 'Failed to send request.' });
  }
};

/**
 * Accept a Team Request
 */
const acceptRequest = (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = memoryStore.requests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.receiverId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to respond to this request.' });
    }

    if (request.status !== 'PENDING') {
      return res.status(400).json({ success: false, message: `Request is already ${request.status}.` });
    }

    const team = memoryStore.teams.find(t => t.id === request.teamId);
    const project = memoryStore.projects.find(p => p.id === request.projectId);

    if (!team || !project) {
      return res.status(404).json({ success: false, message: 'Associated team or project no longer exists.' });
    }

    // Verify team capacity
    if (team.members.length >= project.teamSize) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept: Team has reached its maximum size.'
      });
    }

    // The student joining the team is either sender (if JOIN_TEAM) or receiver (if INVITE_STUDENT)
    const studentToAddId = request.type === 'JOIN_TEAM' ? request.senderId : request.receiverId;

    // Check if student already in team
    if (team.members.some(m => m.studentId === studentToAddId)) {
      request.status = 'ACCEPTED';
      return res.json({ success: true, message: 'Student is already a member.' });
    }

    // Add student to team
    team.members.push({
      studentId: studentToAddId,
      role: 'Member & Technical Specialist',
      joinedAt: new Date().toISOString()
    });

    // Check if team is now full
    if (team.members.length >= project.teamSize) {
      team.status = 'FULL';
    }

    request.status = 'ACCEPTED';
    request.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Request accepted! Team member successfully enrolled.',
      team
    });
  } catch (error) {
    console.error('Error accepting request:', error);
    return res.status(500).json({ success: false, message: 'Failed to accept request.' });
  }
};

/**
 * Reject a Team Request
 */
const rejectRequest = (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user.id;

    const request = memoryStore.requests.find(r => r.id === requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (request.receiverId !== userId && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Not authorized to reject this request.' });
    }

    request.status = 'REJECTED';
    request.updatedAt = new Date().toISOString();

    return res.json({
      success: true,
      message: 'Request has been rejected.',
      request
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    return res.status(500).json({ success: false, message: 'Failed to reject request.' });
  }
};

/**
 * Get all requests for the logged in user (sent, received, pending)
 */
const getMyRequests = (req, res) => {
  try {
    const userId = req.user.id;

    const received = memoryStore.requests.filter(r => r.receiverId === userId);
    const sent = memoryStore.requests.filter(r => r.senderId === userId);

    const enrich = (reqList) => reqList.map(r => {
      const sender = memoryStore.students.find(s => s.id === r.senderId);
      const receiver = memoryStore.students.find(s => s.id === r.receiverId);
      const team = memoryStore.teams.find(t => t.id === r.teamId);
      const project = memoryStore.projects.find(p => p.id === r.projectId);

      return {
        ...r,
        senderName: sender ? sender.fullName : 'Unknown',
        senderAvatar: sender ? sender.avatarUrl : null,
        senderSkills: sender ? sender.skills : [],
        receiverName: receiver ? receiver.fullName : 'Unknown',
        teamName: team ? team.teamName : 'Team',
        projectTitle: project ? project.title : 'Project'
      };
    });

    return res.json({
      success: true,
      received: enrich(received),
      sent: enrich(sent)
    });
  } catch (error) {
    console.error('Error getting requests:', error);
    return res.status(500).json({ success: false, message: 'Failed to load requests.' });
  }
};

module.exports = {
  sendRequest,
  acceptRequest,
  rejectRequest,
  getMyRequests
};
