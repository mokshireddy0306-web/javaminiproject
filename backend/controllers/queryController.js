/**
 * ============================================================================
 * PROJECTHUB AI - QUERY CONTROLLER
 * Handles student queries, faculty responses, and issue resolution tracking.
 * ============================================================================
 */

const { memoryStore, uuidv4 } = require('../config/db');

/**
 * Raise a New Query (Student)
 */
const raiseQuery = (req, res) => {
  try {
    const studentId = req.user.id;
    const { projectId, subject, queryText, category } = req.body;

    if (!subject || !queryText) {
      return res.status(400).json({
        success: false,
        message: 'Subject and Query Description are required.'
      });
    }

    const newQuery = {
      id: `q-${uuidv4().substring(0, 8)}`,
      studentId,
      projectId: projectId || null,
      subject: subject.trim(),
      queryText: queryText.trim(),
      category: category || 'TECHNICAL',
      adminReply: null,
      status: 'OPEN',
      repliedByAdminId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    memoryStore.queries.push(newQuery);

    return res.status(201).json({
      success: true,
      message: 'Query submitted successfully. Faculty has been notified.',
      query: newQuery
    });
  } catch (error) {
    console.error('Error raising query:', error);
    return res.status(500).json({ success: false, message: 'Failed to submit query.' });
  }
};

/**
 * Get Queries (Filtered for Student, or all for Admin)
 */
const getQueries = (req, res) => {
  try {
    const user = req.user;
    let queryList = [...memoryStore.queries];

    if (user.role === 'STUDENT') {
      queryList = queryList.filter(q => q.studentId === user.id);
    }

    const enriched = queryList.map(q => {
      const student = memoryStore.students.find(s => s.id === q.studentId);
      const project = memoryStore.projects.find(p => p.id === q.projectId);
      const admin = memoryStore.admins.find(a => a.id === q.repliedByAdminId);

      return {
        ...q,
        studentName: student ? student.fullName : 'Student',
        studentUsn: student ? student.usn : '',
        projectTitle: project ? project.title : 'General Inquiry',
        repliedByAdminName: admin ? admin.fullName : null
      };
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return res.json({
      success: true,
      count: enriched.length,
      queries: enriched
    });
  } catch (error) {
    console.error('Error loading queries:', error);
    return res.status(500).json({ success: false, message: 'Failed to load queries.' });
  }
};

/**
 * Reply and Resolve Query (Admin only)
 */
const replyQuery = (req, res) => {
  try {
    const { queryId } = req.params;
    const { adminReply, status } = req.body;

    const query = memoryStore.queries.find(q => q.id === queryId);
    if (!query) {
      return res.status(404).json({ success: false, message: 'Query not found.' });
    }

    if (!adminReply) {
      return res.status(400).json({ success: false, message: 'Reply text cannot be empty.' });
    }

    query.adminReply = adminReply.trim();
    query.status = status || 'RESOLVED';
    query.repliedByAdminId = req.user.id;
    query.updatedAt = new Date().toISOString();

    // Notify Student
    memoryStore.notifications.push({
      id: `notif-${uuidv4().substring(0, 8)}`,
      userId: query.studentId,
      userType: 'STUDENT',
      title: 'Faculty Query Resolved',
      message: `Your query "${query.subject}" received an official response.`,
      link: '/queries',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    return res.json({
      success: true,
      message: 'Response posted and query marked resolved.',
      query
    });
  } catch (error) {
    console.error('Error replying to query:', error);
    return res.status(500).json({ success: false, message: 'Failed to post reply.' });
  }
};

module.exports = {
  raiseQuery,
  getQueries,
  replyQuery
};
