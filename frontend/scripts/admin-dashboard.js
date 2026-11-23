/**
 * ============================================================================
 * PROJECTHUB AI - FACULTY ADMIN DASHBOARD CONTROLLER
 * Powers:
 * 1. Analytics KPIs (Live Saturation & Velocity Metrics)
 * 2. Section-Isolated Capstone Project Creation & Draft Persistence
 * 3. Cohort Project Catalogue Management (Active Deletion & Cohort Review)
 * 4. Student Inquiry Resolution with 3D Modal & Direct Student Notification
 * ============================================================================
 */

const AdminDashboard = {
  activeQueryId: null,

  async init() {
    this.bindAdminEvents();
    this.restoreDraft();
    await this.loadAnalytics();
    await this.loadQueries();
    await this.loadProjects();

    if (window.ThreeDEngine && window.ThreeDEngine.refreshCardTilt) {
      window.ThreeDEngine.refreshCardTilt();
    }
  },

  bindAdminEvents() {
    const createProjectForm = document.getElementById('createProjectForm');
    if (createProjectForm) {
      createProjectForm.addEventListener('submit', (e) => this.handleCreateProject(e));
    }
  },

  /**
   * Restores locally saved project draft if available
   */
  restoreDraft() {
    const raw = localStorage.getItem('projecthub_admin_proj_draft');
    if (!raw) return;

    try {
      const draft = JSON.parse(raw);
      if (draft.title && document.getElementById('newProjTitle')) {
        document.getElementById('newProjTitle').value = draft.title;
      }
      if (draft.description && document.getElementById('newProjDesc')) {
        document.getElementById('newProjDesc').value = draft.description;
      }
      if (draft.department && document.getElementById('newProjDept')) {
        document.getElementById('newProjDept').value = draft.department;
      }
      if (draft.year && document.getElementById('newProjYear')) {
        document.getElementById('newProjYear').value = draft.year;
      }
      if (draft.section && document.getElementById('newProjSection')) {
        document.getElementById('newProjSection').value = draft.section;
      }
      if (draft.requiredSkills && document.getElementById('newProjSkills')) {
        document.getElementById('newProjSkills').value = draft.requiredSkills;
      }
      if (draft.deadline && document.getElementById('newProjDeadline')) {
        document.getElementById('newProjDeadline').value = draft.deadline;
      }
      if (draft.priority && document.getElementById('newProjPriority')) {
        document.getElementById('newProjPriority').value = draft.priority;
      }
      console.log('[AdminDashboard] Restored active project draft from local storage.');
    } catch (e) {
      console.warn('Failed to parse draft:', e);
    }
  },

  /**
   * Saves current form state as draft
   */
  saveDraftProject() {
    const draft = {
      title: document.getElementById('newProjTitle')?.value || '',
      description: document.getElementById('newProjDesc')?.value || '',
      department: document.getElementById('newProjDept')?.value || 'CSE',
      year: document.getElementById('newProjYear')?.value || '3',
      section: document.getElementById('newProjSection')?.value || 'A',
      requiredSkills: document.getElementById('newProjSkills')?.value || '',
      deadline: document.getElementById('newProjDeadline')?.value || '',
      priority: document.getElementById('newProjPriority')?.value || 'HIGH'
    };

    localStorage.setItem('projecthub_admin_proj_draft', JSON.stringify(draft));
    window.ProjectHubApp.showToast('Draft state saved locally! Form values are preserved.', 'success');
  },

  // --------------------------------------------------------------------------
  // 1. ANALYTICS & KPIS
  // --------------------------------------------------------------------------
  async loadAnalytics() {
    try {
      const response = await window.ProjectHubAPI.request('/admin/analytics');
      const kpis = response.analytics?.kpis || window.ProjectHubMock.analytics.kpis;

      document.getElementById('kpiTotalProjects').textContent = kpis.totalProjects;
      document.getElementById('kpiActiveProjects').textContent = kpis.activeProjects;
      document.getElementById('kpiStudents').textContent = kpis.registeredStudents;
      document.getElementById('kpiTeamsFormed').textContent = kpis.teamsFormed;
      document.getElementById('kpiPendingStudents').textContent = kpis.pendingStudents;
      document.getElementById('kpiCompletedProjects').textContent = kpis.completedProjects;
      document.getElementById('kpiOpenQueries').textContent = kpis.openQueries;
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    }
  },

  // --------------------------------------------------------------------------
  // 2. PROJECT PUBLISHING WITH COHORT ISOLATION
  // --------------------------------------------------------------------------
  async handleCreateProject(e) {
    e.preventDefault();
    const btn = e.currentTarget.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<span class="spinner"></span> Publishing Project...';
    btn.disabled = true;

    const payload = {
      title: document.getElementById('newProjTitle').value.trim(),
      description: document.getElementById('newProjDesc').value.trim(),
      department: document.getElementById('newProjDept').value,
      year: parseInt(document.getElementById('newProjYear').value),
      section: document.getElementById('newProjSection').value,
      requiredSkills: document.getElementById('newProjSkills').value.split(',').map(s => s.trim()).filter(Boolean),
      deadline: document.getElementById('newProjDeadline').value,
      teamSize: parseInt(document.getElementById('newProjTeamSize').value) || 4,
      priority: document.getElementById('newProjPriority').value,
      status: 'PUBLISHED'
    };

    try {
      const response = await window.ProjectHubAPI.request('/admin/projects', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.success) {
        window.ProjectHubApp.showToast(`Project Published! Cohort visibility locked to ${payload.department}-${payload.year}-${payload.section}.`, 'success');
        e.currentTarget.reset();
        localStorage.removeItem('projecthub_admin_proj_draft');
        
        await this.loadAnalytics();
        await this.loadProjects();
      } else {
        window.ProjectHubApp.showToast(response.message, 'error');
      }
    } catch (err) {
      window.ProjectHubApp.showToast(err.message, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  },

  // --------------------------------------------------------------------------
  // 3. COHORT PROJECT CATALOGUE & DELETION MANAGEMENT
  // --------------------------------------------------------------------------
  async loadProjects() {
    const container = document.getElementById('adminProjectsGrid');
    if (!container) return;
    container.innerHTML = `<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>`;

    try {
      const res = await window.ProjectHubAPI.request('/admin/projects');
      const projects = res.projects || [];

      if (projects.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center;">
            <p style="color: var(--text-secondary);">No capstone projects published yet. Use the form above to add one.</p>
          </div>`;
        return;
      }

      container.innerHTML = projects.map(p => `
        <div class="glass-card project-card tilt-3d animate-fade-in-up">
          <div>
            <div class="card-top">
              <span class="badge ${p.priority === 'CRITICAL' ? 'badge-rose' : 'badge-blue'}">${p.priority}</span>
              <span class="cohort-badge"><span class="cohort-dot"></span>${p.department}-${p.year}-${p.section}</span>
            </div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
          </div>

          <div>
            <div class="project-meta-row">
              <span>👥 Max Size: <strong>${p.teamSize}</strong></span>
              <span>🛡️ Squads: <strong style="color: #60A5FA;">${p.teamsCount || 0} formed</strong></span>
              <span>📅 Deadline: ${p.deadline}</span>
            </div>

            <div class="project-skills-list">
              ${(p.requiredSkills || []).map(s => `<span class="skill-chip matched">${s}</span>`).join('')}
            </div>

            <div class="project-card-footer">
              <button class="btn btn-secondary btn-sm" onclick="AdminDashboard.viewCohortDetails('${p.department}', '${p.year}', '${p.section}')">
                👁️ Cohort View
              </button>
              <button class="btn btn-danger btn-sm" onclick="AdminDashboard.deleteProject('${p.id}', '${p.title.replace(/'/g, "\\'")}')">
                🗑️ Delete Project
              </button>
            </div>
          </div>
        </div>
      `).join('');

      if (window.ThreeDEngine) window.ThreeDEngine.refreshCardTilt();
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p style="color: var(--color-rose);">Failed to load published projects.</p>`;
    }
  },

  async deleteProject(projectId, projectTitle) {
    const confirmed = confirm(`Are you sure you want to permanently delete project:\n"${projectTitle}"?\n\nThis will remove it from the student matching pool.`);
    if (!confirmed) return;

    try {
      const res = await window.ProjectHubAPI.request(`/admin/projects/${projectId}`, { method: 'DELETE' });
      window.ProjectHubApp.showToast(res.message || 'Project deleted successfully.', 'success');
      await this.loadProjects();
      await this.loadAnalytics();
    } catch (err) {
      window.ProjectHubApp.showToast(err.message || 'Failed to delete project.', 'error');
    }
  },

  viewCohortDetails(dept, year, sec) {
    window.ProjectHubApp.showToast(`Cohort Filter: Only students in ${dept} Year ${year} Section ${sec} have access to this project.`, 'info');
  },

  // --------------------------------------------------------------------------
  // 4. STUDENT INQUIRIES & RESOLUTION MODAL
  // --------------------------------------------------------------------------
  async loadQueries() {
    const container = document.getElementById('adminQueriesList');
    if (!container) return;

    try {
      const response = await window.ProjectHubAPI.request('/queries');
      const queries = response.queries || [];

      if (queries.length === 0) {
        container.innerHTML = `<div class="glass-card" style="padding: 2rem; text-align: center;"><p style="color: var(--text-secondary);">No open student queries at this time.</p></div>`;
        return;
      }

      container.innerHTML = queries.map(q => {
        const safeStudent = (q.studentName || 'Student').replace(/'/g, "\\'");
        const safeUsn = (q.studentUsn || '1MS21CS001').replace(/'/g, "\\'");
        const safeSubject = (q.subject || 'Query').replace(/'/g, "\\'");
        const safeText = (q.queryText || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

        return `
        <div class="glass-card tilt-3d animate-fade-in-up" style="padding: 1.5rem; margin-bottom: 1rem;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <div>
              <span class="badge ${q.status === 'OPEN' ? 'badge-amber' : 'badge-green'}">${q.status}</span>
              <h4 style="font-size: 1.1rem; margin-top: 0.35rem;">${q.subject}</h4>
              <span style="font-size: 0.78rem; color: var(--text-secondary);">By <strong>${q.studentName}</strong> (${q.studentUsn || 'Student'})</span>
            </div>
            ${q.status === 'OPEN' ? `
              <button class="btn btn-primary btn-sm" onclick="AdminDashboard.openReplyModal('${q.id}', '${safeStudent}', '${safeUsn}', '${safeSubject}', '${safeText}')">
                Reply & Resolve →
              </button>
            ` : `
              <span class="badge badge-green">✓ Resolved</span>
            `}
          </div>

          <p style="font-size: 0.88rem; color: var(--text-primary); margin-bottom: 0.75rem; background: rgba(0,0,0,0.18); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm); line-height: 1.45;">
            "${q.queryText}"
          </p>

          ${q.adminReply ? `
            <div style="padding: 0.75rem 1rem; background: rgba(59, 130, 246, 0.1); border-left: 3px solid var(--color-primary); border-radius: var(--radius-sm);">
              <span style="font-size: 0.74rem; font-weight: 700; color: var(--color-primary); display: block;">FACULTY RESOLUTION:</span>
              <p style="font-size: 0.85rem; color: #BFDBFE;">${q.adminReply}</p>
            </div>
          ` : ''}
        </div>
      `;
      }).join('');

      if (window.ThreeDEngine) window.ThreeDEngine.refreshCardTilt();
    } catch (err) {
      console.error(err);
    }
  },

  // --------------------------------------------------------------------------
  // 3D FACULTY REPLY MODAL SYSTEM (Replaces prompt)
  // --------------------------------------------------------------------------
  openReplyModal(queryId, studentName, studentUsn, subject, queryText) {
    this.activeQueryId = queryId;

    const nameEl = document.getElementById('modalReplyStudentName');
    if (nameEl) nameEl.textContent = studentName;

    const usnEl = document.getElementById('modalReplyStudentUsn');
    if (usnEl) usnEl.textContent = studentUsn;

    const subjEl = document.getElementById('modalReplySubject');
    if (subjEl) subjEl.textContent = subject;

    const textEl = document.getElementById('modalReplyText');
    if (textEl) textEl.textContent = `"${queryText}"`;

    const input = document.getElementById('adminReplyInput');
    if (input) {
      input.value = 'This request has been officially reviewed and approved by the academic capstone committee.';
    }

    const modal = document.getElementById('modalAdminReply');
    if (modal) modal.classList.add('is-open');
  },

  closeReplyModal() {
    const modal = document.getElementById('modalAdminReply');
    if (modal) modal.classList.remove('is-open');
    this.activeQueryId = null;
  },

  async submitReply() {
    if (!this.activeQueryId) return;

    const replyInput = document.getElementById('adminReplyInput');
    const replyText = replyInput ? replyInput.value.trim() : '';

    if (!replyText) {
      window.ProjectHubApp.showToast('Please enter your resolution before publishing.', 'error');
      return;
    }

    const btn = document.getElementById('btnSubmitAdminReply');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Publishing Resolution...';
    }

    try {
      const res = await window.ProjectHubAPI.request(`/queries/${this.activeQueryId}/reply`, {
        method: 'PUT',
        body: JSON.stringify({ adminReply: replyText, status: 'RESOLVED' })
      });

      window.ProjectHubApp.showToast(res.message || 'Inquiry officially resolved and student notified!', 'success');
      this.closeReplyModal();
      await this.loadQueries();
      await this.loadAnalytics();
    } catch (err) {
      window.ProjectHubApp.showToast(err.message || 'Failed to submit resolution.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Publish Resolution & Resolve →';
      }
    }
  }
};

window.AdminDashboard = AdminDashboard;
