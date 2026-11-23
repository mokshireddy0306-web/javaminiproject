/**
 * ============================================================================
 * PROJECTHUB AI - STUDENT DASHBOARD CONTROLLER
 * Powers the 6 Student Modules with 3D Transitions & Interactive Modals:
 * 1. Active Projects (Cohort Visibility & 3D Project Details Modal)
 * 2. Recommended Projects (Skill Match & Squad Creation Modal)
 * 3. Available Students (Direct Profile Modal & Squad Invitations)
 * 4. Team Requests (Multi-Account Inbound / Outbound Acceptance)
 * 5. My Teams & Milestones (Live Squad Roster & Velocity Flow)
 * 6. My Profile & Faculty Queries (Persistent Profile Sync & Query Submission)
 * ============================================================================
 */

const StudentDashboard = {
  currentModule: 'active-projects',
  currentRequestTab: 'received',
  currentInviteTarget: null,
  currentProfileTarget: null,
  currentViewedProject: null,

  async init() {
    this.bindNavigation();
    await this.refreshDashboardStats();
    await this.loadActiveProjects();
  },

  bindNavigation() {
    document.querySelectorAll('.student-nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        document.querySelectorAll('.student-nav-item').forEach(i => i.classList.remove('is-active'));
        e.currentTarget.classList.add('is-active');

        const targetModule = e.currentTarget.getAttribute('data-module');
        this.switchModule(targetModule);
      });
    });
  },

  switchModule(moduleName) {
    this.currentModule = moduleName;
    document.querySelectorAll('.student-module-view').forEach(v => {
      v.style.display = 'none';
      v.classList.remove('animate-3d-flip');
    });

    // Synchronize sidebar active state
    document.querySelectorAll('.student-nav-item').forEach(i => {
      if (i.getAttribute('data-module') === moduleName) {
        i.classList.add('is-active');
      } else {
        i.classList.remove('is-active');
      }
    });

    const view = document.getElementById(`mod-${moduleName}`);
    if (view) {
      view.style.display = 'block';
      // Cool 3D Perspective Flip transition!
      view.classList.add('animate-3d-flip');
    }

    if (moduleName === 'active-projects') this.loadActiveProjects();
    if (moduleName === 'recommended-projects') this.loadRecommendedProjects();
    if (moduleName === 'available-students') this.loadAvailableStudents();
    if (moduleName === 'team-requests') this.loadTeamRequests();
    if (moduleName === 'my-teams') this.loadMyTeams();
    if (moduleName === 'my-profile') this.loadMyProfile();

    if (window.ThreeDEngine && window.ThreeDEngine.refreshCardTilt) {
      window.ThreeDEngine.refreshCardTilt();
    }
  },

  /**
   * Refreshes KPI cards on top of dashboard
   */
  async refreshDashboardStats() {
    try {
      const [projRes, reqRes, teamRes] = await Promise.all([
        window.ProjectHubAPI.request('/projects/visible'),
        window.ProjectHubAPI.request('/requests/my-requests'),
        window.ProjectHubAPI.request('/teams/my-teams')
      ]);

      const statProj = document.getElementById('studentStatActiveProjects');
      if (statProj && projRes.projects) {
        statProj.textContent = projRes.projects.length;
      }

      const statInvites = document.getElementById('studentStatInvitations');
      const pendingReceived = (reqRes.received || []).filter(r => r.status === 'PENDING');
      if (statInvites) {
        statInvites.textContent = pendingReceived.length;
      }

      const badgeReceived = document.getElementById('badgeReqReceivedCount');
      if (badgeReceived) {
        badgeReceived.textContent = pendingReceived.length;
        badgeReceived.style.display = pendingReceived.length > 0 ? 'inline-block' : 'none';
      }

      const statTeams = document.getElementById('studentStatTeams');
      if (statTeams && teamRes.teams) {
        statTeams.textContent = teamRes.teams.length;
      }
    } catch (err) {
      console.warn('[StudentDashboard] Error refreshing stats:', err);
    }
  },

  // --------------------------------------------------------------------------
  // MODULE 1: ACTIVE PROJECTS
  // --------------------------------------------------------------------------
  async loadActiveProjects() {
    const container = document.getElementById('activeProjectsGrid');
    if (!container) return;
    container.innerHTML = `<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>`;

    try {
      const response = await window.ProjectHubAPI.request('/projects/visible');
      const projects = response.projects || [];

      if (projects.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="grid-column: 1 / -1; padding: 3rem; text-align: center;">
            <h3>No Projects Assigned to Your Cohort</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem;">
              You are viewing cohort <strong>${response.cohort || 'Assigned Section'}</strong>. Faculty has not published projects for this section yet.
            </p>
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
              <span>👥 Team Size: <strong>${p.teamSize}</strong></span>
              <span>⚡ Remaining: <strong style="color: var(--color-emerald);">${p.remainingSlots} slots</strong></span>
              <span>📅 ${p.deadline}</span>
            </div>

            <div class="project-skills-list">
              ${(p.requiredSkills || []).map(s => `<span class="skill-chip matched">${s}</span>`).join('')}
            </div>

            <div class="project-card-footer">
              <button class="btn btn-secondary btn-sm" onclick="StudentDashboard.viewProjectDetails('${p.id}')">View Details</button>
              <button class="btn btn-primary btn-sm" onclick="StudentDashboard.openCreateTeamModal('${p.id}', '${p.title.replace(/'/g, "\\'")}')">Start Squad</button>
            </div>
          </div>
        </div>
      `).join('');

      if (window.ThreeDEngine) window.ThreeDEngine.refreshCardTilt();
    } catch (err) {
      console.error(err);
      container.innerHTML = `<p style="color: var(--color-rose);">Failed to load active projects.</p>`;
    }
  },

  // --------------------------------------------------------------------------
  // MODULE 2: RECOMMENDED PROJECTS (AI Skill Match)
  // --------------------------------------------------------------------------
  async loadRecommendedProjects() {
    const container = document.getElementById('recommendedProjectsGrid');
    if (!container) return;
    container.innerHTML = `<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>`;

    try {
      const response = await window.ProjectHubAPI.request('/projects/recommended');
      const projects = response.recommendedProjects || [];

      container.innerHTML = projects.map(p => `
        <div class="glass-card project-card tilt-3d animate-fade-in-up">
          <div>
            <div class="card-top">
              <span class="match-score-pill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                ${p.matchScore || 88}% Skill Match
              </span>
              <span class="badge badge-purple">${p.priority}</span>
            </div>
            <h3 class="project-title">${p.title}</h3>
            <p class="project-desc">${p.description}</p>
          </div>

          <div>
            <div class="project-skills-list">
              ${(p.requiredSkills || []).map(s => `<span class="skill-chip matched">✓ ${s}</span>`).join('')}
            </div>

            <div class="project-card-footer">
              <button class="btn btn-secondary btn-sm" onclick="StudentDashboard.viewProjectDetails('${p.id}')">Review Scope</button>
              <button class="btn btn-primary btn-sm" onclick="StudentDashboard.openCreateTeamModal('${p.id}', '${p.title.replace(/'/g, "\\'")}')">Start Squad</button>
            </div>
          </div>
        </div>
      `).join('');

      if (window.ThreeDEngine) window.ThreeDEngine.refreshCardTilt();
    } catch (err) {
      console.error(err);
    }
  },

  // --------------------------------------------------------------------------
  // 3D PROJECT DETAILS MODAL
  // --------------------------------------------------------------------------
  async viewProjectDetails(projectId) {
    try {
      const res = await window.ProjectHubAPI.request(`/projects/${projectId}`);
      const project = res.project;
      const teams = res.teams || [];
      if (!project) return;

      this.currentViewedProject = project;

      document.getElementById('modalProjTitle').textContent = project.title;
      document.getElementById('modalProjPriority').textContent = project.priority || 'HIGH';
      document.getElementById('modalProjCohort').textContent = `Cohort: ${project.department}-${project.year}-${project.section}`;
      document.getElementById('modalProjDesc').textContent = project.description;
      document.getElementById('modalProjSlots').textContent = `${project.teamSize} Member Limit • ${project.remainingSlots} Remaining Slots`;
      document.getElementById('modalProjDeadline').textContent = project.deadline;

      const skillsContainer = document.getElementById('modalProjSkills');
      skillsContainer.innerHTML = (project.requiredSkills || []).map(s => `<span class="skill-chip matched">✓ ${s}</span>`).join('');

      const teamsContainer = document.getElementById('modalProjTeamsList');
      if (teams.length === 0) {
        teamsContainer.innerHTML = `<span style="color: var(--text-muted);">No squads registered yet. Be the first to start a squad!</span>`;
      } else {
        teamsContainer.innerHTML = teams.map(t => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0.85rem; background: rgba(255,255,255,0.03); border-radius: var(--radius-sm); margin-bottom: 0.4rem;">
            <span>🛡️ <strong>${t.teamName}</strong> (${(t.members || []).length}/${t.teamSizeLimit || 4} members)</span>
            <span class="badge badge-blue">${t.status}</span>
          </div>
        `).join('');
      }

      const modal = document.getElementById('modalProjectDetails');
      if (modal) modal.classList.add('is-open');

    } catch (err) {
      window.ProjectHubApp.showToast(`Failed to load project details: ${err.message}`, 'error');
    }
  },

  closeProjectDetailsModal() {
    const modal = document.getElementById('modalProjectDetails');
    if (modal) modal.classList.remove('is-open');
    this.currentViewedProject = null;
  },

  // --------------------------------------------------------------------------
  // MODULE 3: AVAILABLE STUDENTS (Team Discovery, Profile Modal & Direct Invites)
  // --------------------------------------------------------------------------
  async loadAvailableStudents(filters = {}) {
    const container = document.getElementById('availableStudentsGrid');
    if (!container) return;
    container.innerHTML = `<div class="skeleton skeleton-card"></div><div class="skeleton skeleton-card"></div>`;

    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await window.ProjectHubAPI.request(`/students/available?${queryParams}`);
      const students = response.students || [];

      if (students.length === 0) {
        container.innerHTML = `<div class="glass-card" style="grid-column: 1 / -1; padding: 2.5rem; text-align: center;"><p style="color: var(--text-secondary);">No peers found matching current filter.</p></div>`;
        return;
      }

      container.innerHTML = students.map(s => {
        const skillsString = (s.skills || []).join(', ');
        const safeName = s.fullName.replace(/'/g, "\\'");
        const safeSkills = skillsString.replace(/'/g, "\\'");
        const safeAvatar = (s.avatarUrl || '').replace(/'/g, "\\'");

        return `
        <div class="glass-card student-card tilt-3d animate-fade-in-up">
          <div>
            <div class="student-card-header">
              <img src="${s.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" class="student-avatar-lg" alt="${s.fullName}">
              <div>
                <h4 class="student-name">${s.fullName}</h4>
                <span class="student-cohort">${s.department} • Year ${s.year} • Sec ${s.section}</span>
                <div style="margin-top: 0.35rem;"><span class="badge ${s.experienceLevel === 'Advanced' ? 'badge-purple' : 'badge-blue'}">${s.experienceLevel}</span></div>
              </div>
            </div>
            <p style="font-size: 0.84rem; color: var(--text-secondary); margin-bottom: 0.85rem; line-height: 1.45;">${s.bio || 'Available for technical team matching.'}</p>
          </div>

          <div>
            <div class="project-skills-list">
              ${(s.skills || []).map(sk => `<span class="skill-chip">${sk}</span>`).join('')}
            </div>

            <div class="project-card-footer">
              <button class="btn btn-secondary btn-sm" onclick="StudentDashboard.openStudentProfileModal('${s.id}')">
                View Profile
              </button>
              <button class="btn btn-primary btn-sm" onclick="StudentDashboard.openInviteModal('${s.id}', '${safeName}', '${safeAvatar}', '${safeSkills}')">
                Send Team Request
              </button>
            </div>
          </div>
        </div>
      `;
      }).join('');

      if (window.ThreeDEngine) window.ThreeDEngine.refreshCardTilt();
    } catch (err) {
      console.error(err);
    }
  },

  // --------------------------------------------------------------------------
  // 3D STUDENT PROFILE MODAL
  // --------------------------------------------------------------------------
  async openStudentProfileModal(studentId) {
    try {
      const res = await window.ProjectHubAPI.request('/students/available');
      const student = (res.students || []).find(s => s.id === studentId);
      if (!student) return;

      this.currentProfileTarget = student;

      document.getElementById('modalProfileAvatar').src = student.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      document.getElementById('modalProfileName').textContent = student.fullName;
      document.getElementById('modalProfileCohort').textContent = `${student.department} • Year ${student.year} • Section ${student.section}`;
      document.getElementById('modalProfileLevel').innerHTML = `<span class="badge ${student.experienceLevel === 'Advanced' ? 'badge-purple' : 'badge-blue'}">${student.experienceLevel}</span>`;
      document.getElementById('modalProfileBio').textContent = student.bio || 'Passionate student engineer eager to collaborate on production-quality capstone projects.';
      document.getElementById('modalProfileStatus').textContent = `● ${student.availabilityStatus}`;

      const skillsContainer = document.getElementById('modalProfileSkills');
      skillsContainer.innerHTML = (student.skills || []).map(s => `<span class="skill-chip matched">${s}</span>`).join('');

      const modal = document.getElementById('modalStudentProfile');
      if (modal) modal.classList.add('is-open');

    } catch (err) {
      window.ProjectHubApp.showToast(`Failed to open profile: ${err.message}`, 'error');
    }
  },

  closeStudentProfileModal() {
    const modal = document.getElementById('modalStudentProfile');
    if (modal) modal.classList.remove('is-open');
    this.currentProfileTarget = null;
  },

  triggerInviteFromProfile() {
    if (!this.currentProfileTarget) return;
    const target = this.currentProfileTarget;
    this.closeStudentProfileModal();
    this.openInviteModal(target.id, target.fullName, target.avatarUrl, (target.skills || []).join(', '));
  },

  // --------------------------------------------------------------------------
  // SQUAD INVITATION MODAL SYSTEM
  // --------------------------------------------------------------------------
  async openInviteModal(studentId, studentName, avatarUrl, skills) {
    this.currentInviteTarget = { id: studentId, name: studentName };

    try {
      const teamRes = await window.ProjectHubAPI.request('/teams/my-teams');
      const teams = teamRes.teams || [];

      if (teams.length === 0) {
        window.ProjectHubApp.showToast("You don't have an active squad yet! Please start a squad under 'Active Projects' before sending invitations.", 'error');
        this.switchModule('active-projects');
        return;
      }

      // Populate squad dropdown
      const select = document.getElementById('modalInviteTeamSelect');
      if (select) {
        select.innerHTML = teams.map(t => `
          <option value="${t.id}" data-project="${t.projectId}">${t.teamName} (${t.projectTitle})</option>
        `).join('');
      }

      // Populate target info
      const nameEl = document.getElementById('modalInviteStudentName');
      if (nameEl) nameEl.textContent = studentName;

      const skillsEl = document.getElementById('modalInviteStudentSkills');
      if (skillsEl) skillsEl.textContent = `Skills: ${skills || 'Technical engineering'}`;

      const avatarEl = document.getElementById('modalInviteStudentAvatar');
      if (avatarEl) {
        avatarEl.src = avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
      }

      const msgEl = document.getElementById('modalInviteMessage');
      if (msgEl) {
        msgEl.value = `Hey ${studentName}! We would love to collaborate with you on our capstone squad. Your skillset is a great match!`;
      }

      const modal = document.getElementById('modalInviteStudent');
      if (modal) modal.classList.add('is-open');

    } catch (err) {
      window.ProjectHubApp.showToast(`Error initializing invite: ${err.message}`, 'error');
    }
  },

  closeInviteModal() {
    const modal = document.getElementById('modalInviteStudent');
    if (modal) modal.classList.remove('is-open');
    this.currentInviteTarget = null;
  },

  async submitInvitation() {
    if (!this.currentInviteTarget) return;

    const select = document.getElementById('modalInviteTeamSelect');
    if (!select || !select.value) {
      window.ProjectHubApp.showToast('Please select a squad.', 'error');
      return;
    }

    const teamId = select.value;
    const selectedOption = select.options[select.selectedIndex];
    const projectId = selectedOption ? selectedOption.getAttribute('data-project') : '';
    const message = document.getElementById('modalInviteMessage').value.trim();

    const btn = document.getElementById('btnSubmitInvitation');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Sending Invitation...';
    }

    try {
      const res = await window.ProjectHubAPI.request('/requests', {
        method: 'POST',
        body: JSON.stringify({
          receiverId: this.currentInviteTarget.id,
          teamId,
          projectId,
          type: 'INVITE_STUDENT',
          message: message || 'You have been invited to join our project squad.'
        })
      });

      window.ProjectHubApp.showToast(res.message || 'Invitation sent successfully!', 'success');
      this.closeInviteModal();

      // Refresh requests and stats
      await this.refreshDashboardStats();
      if (window.ProjectHubApp.fetchNotifications) {
        window.ProjectHubApp.fetchNotifications();
      }
    } catch (err) {
      window.ProjectHubApp.showToast(err.message || 'Failed to send invitation.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Send Invitation →';
      }
    }
  },

  // --------------------------------------------------------------------------
  // START SQUAD 3D MODAL SYSTEM (Replaces ugly browser prompt)
  // --------------------------------------------------------------------------
  async openCreateTeamModal(projectId = null, projectTitle = null) {
    if (this.currentViewedProject && !projectId) {
      projectId = this.currentViewedProject.id;
      projectTitle = this.currentViewedProject.title;
      this.closeProjectDetailsModal();
    }

    const select = document.getElementById('createTeamProjectSelect');
    if (select) {
      try {
        const res = await window.ProjectHubAPI.request('/projects/visible');
        const projects = res.projects || [];
        select.innerHTML = projects.map(p => `
          <option value="${p.id}" ${p.id === projectId ? 'selected' : ''}>${p.title} (${p.department}-${p.year}-${p.section})</option>
        `).join('');
      } catch (e) {
        if (projectId && projectTitle) {
          select.innerHTML = `<option value="${projectId}" selected>${projectTitle}</option>`;
        }
      }
    }

    const modal = document.getElementById('modalCreateTeam');
    if (modal) modal.classList.add('is-open');
  },

  closeCreateTeamModal() {
    const modal = document.getElementById('modalCreateTeam');
    if (modal) modal.classList.remove('is-open');
  },

  async submitCreateTeam() {
    const teamNameInput = document.getElementById('createTeamNameInput');
    const projectSelect = document.getElementById('createTeamProjectSelect');

    const teamName = teamNameInput ? teamNameInput.value.trim() : '';
    const projectId = projectSelect ? projectSelect.value : '';

    if (!teamName) {
      window.ProjectHubApp.showToast('Please enter a team name.', 'error');
      return;
    }

    const btn = document.getElementById('btnConfirmCreateTeam');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Creating Squad...';
    }

    try {
      const res = await window.ProjectHubAPI.request('/teams', {
        method: 'POST',
        body: JSON.stringify({ projectId, teamName })
      });

      window.ProjectHubApp.showToast(res.message || 'Squad successfully registered!', 'success');
      this.closeCreateTeamModal();
      this.switchModule('my-teams');
    } catch (err) {
      window.ProjectHubApp.showToast(err.message || 'Failed to create squad.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Create Squad Now →';
      }
    }
  },

  // --------------------------------------------------------------------------
  // MODULE 4: TEAM REQUESTS (Inbound vs Outbound tabs)
  // --------------------------------------------------------------------------
  switchRequestTab(tab) {
    this.currentRequestTab = tab;
    const tabs = document.querySelectorAll('.req-tab');
    if (tabs.length >= 2) {
      if (tab === 'received') {
        tabs[0].classList.add('is-active');
        tabs[1].classList.remove('is-active');
        document.getElementById('receivedRequestsList').style.display = 'block';
        document.getElementById('sentRequestsList').style.display = 'none';
      } else {
        tabs[0].classList.remove('is-active');
        tabs[1].classList.add('is-active');
        document.getElementById('receivedRequestsList').style.display = 'none';
        document.getElementById('sentRequestsList').style.display = 'block';
      }
    }
    this.loadTeamRequests();
  },

  async loadTeamRequests() {
    const receivedContainer = document.getElementById('receivedRequestsList');
    const sentContainer = document.getElementById('sentRequestsList');
    if (!receivedContainer || !sentContainer) return;

    try {
      const response = await window.ProjectHubAPI.request('/requests/my-requests');
      const received = response.received || [];
      const sent = response.sent || [];

      // Update badge and stat counts
      const pendingReceived = received.filter(r => r.status === 'PENDING');
      const badge = document.getElementById('badgeReqReceivedCount');
      if (badge) {
        badge.textContent = pendingReceived.length;
        badge.style.display = pendingReceived.length > 0 ? 'inline-block' : 'none';
      }

      const statInvites = document.getElementById('studentStatInvitations');
      if (statInvites) {
        statInvites.textContent = pendingReceived.length;
      }

      // Render Received Requests / Invitations
      if (received.length === 0) {
        receivedContainer.innerHTML = `
          <div class="glass-card" style="padding: 2.5rem; text-align: center;">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📥</div>
            <h4>No Inbound Invitations</h4>
            <p style="color: var(--text-secondary); margin-top: 0.35rem; font-size: 0.88rem;">
              When leaders invite you to their squad, invitations will appear here with instant Accept / Reject buttons.
            </p>
          </div>`;
      } else {
        receivedContainer.innerHTML = received.map(r => `
          <div class="glass-card tilt-3d animate-fade-in-up" style="padding: 1.5rem; margin-bottom: 1rem; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1.25rem;">
            <div style="flex: 1; min-width: 260px;">
              <div style="display: flex; align-items: center; gap: 0.65rem; margin-bottom: 0.35rem;">
                <span class="badge ${r.type === 'INVITE_STUDENT' ? 'badge-purple' : 'badge-blue'}">${r.type === 'INVITE_STUDENT' ? 'Squad Invitation' : 'Join Request'}</span>
                <strong style="color: var(--text-primary); font-size: 1rem;">${r.senderName}</strong>
                <span style="color: var(--text-secondary); font-size: 0.82rem;">for squad <strong>${r.teamName}</strong></span>
              </div>
              <div style="font-size: 0.84rem; color: var(--color-primary); font-weight: 600; margin-bottom: 0.45rem;">
                Project: ${r.projectTitle || 'Capstone Collaboration'}
              </div>
              <p style="font-size: 0.88rem; color: var(--text-secondary); line-height: 1.45; background: rgba(0,0,0,0.18); padding: 0.65rem 0.85rem; border-radius: var(--radius-sm);">
                "${r.message}"
              </p>
              <div style="font-size: 0.74rem; color: var(--text-muted); margin-top: 0.5rem; font-family: var(--font-mono);">
                Received: ${new Date(r.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>

            <div style="display: flex; align-items: center; gap: 0.75rem;">
              ${r.status === 'PENDING' ? `
                <button class="btn btn-primary btn-sm" onclick="StudentDashboard.respondRequest('${r.id}', 'accept')">
                  ✓ Accept Invitation
                </button>
                <button class="btn btn-secondary btn-sm" onclick="StudentDashboard.respondRequest('${r.id}', 'reject')">
                  ✕ Decline
                </button>
              ` : `
                <span class="badge ${r.status === 'ACCEPTED' ? 'badge-green' : 'badge-rose'}" style="padding: 0.45rem 0.85rem; font-size: 0.84rem;">
                  ${r.status === 'ACCEPTED' ? '✓ Joined Squad' : '✕ Declined'}
                </span>
              `}
            </div>
          </div>
        `).join('');
      }

      // Render Sent Requests
      if (sent.length === 0) {
        sentContainer.innerHTML = `
          <div class="glass-card" style="padding: 2.5rem; text-align: center;">
            <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📤</div>
            <h4>No Sent Requests</h4>
            <p style="color: var(--text-secondary); margin-top: 0.35rem; font-size: 0.88rem;">
              You have not sent any squad invitations or team applications yet. Discover peers under "Find Teammates"!
            </p>
          </div>`;
      } else {
        sentContainer.innerHTML = sent.map(r => `
          <div class="glass-card tilt-3d animate-fade-in-up" style="padding: 1.25rem 1.5rem; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            <div>
              <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
                <span class="badge badge-blue">${r.type}</span>
                <span style="font-size: 0.88rem; color: var(--text-secondary);">Sent to:</span>
                <strong style="color: var(--text-primary);">${r.receiverName}</strong>
                <span style="color: var(--text-secondary); font-size: 0.82rem;">(Team: <strong>${r.teamName}</strong>)</span>
              </div>
              <p style="font-size: 0.84rem; color: var(--text-secondary);">${r.message}</p>
            </div>
            <div>
              <span class="badge ${r.status === 'ACCEPTED' ? 'badge-green' : (r.status === 'PENDING' ? 'badge-blue' : 'badge-rose')}">
                ● ${r.status}
              </span>
            </div>
          </div>
        `).join('');
      }

      if (window.ThreeDEngine) window.ThreeDEngine.refreshCardTilt();
    } catch (err) {
      console.error(err);
      receivedContainer.innerHTML = `<p style="color: var(--color-rose);">Failed to load team requests.</p>`;
    }
  },

  async respondRequest(requestId, action) {
    try {
      const res = await window.ProjectHubAPI.request(`/requests/${requestId}/${action}`, { method: 'PUT' });
      window.ProjectHubApp.showToast(res.message || `Request ${action}ed successfully.`, 'success');

      // Refresh requests list
      await this.loadTeamRequests();

      // Refresh squad membership and stats
      await this.refreshDashboardStats();
      if (window.ProjectHubApp.fetchNotifications) {
        window.ProjectHubApp.fetchNotifications();
      }

      // If accepted, also refresh squads view if current
      if (this.currentModule === 'my-teams') {
        this.loadMyTeams();
      }
    } catch (err) {
      window.ProjectHubApp.showToast(err.message || `Failed to ${action} request.`, 'error');
    }
  },

  // --------------------------------------------------------------------------
  // MODULE 5: MY TEAMS & MILESTONES (Live Squad Roster & Velocity Bar)
  // --------------------------------------------------------------------------
  async loadMyTeams() {
    const container = document.getElementById('myTeamsContainer');
    if (!container) return;
    container.innerHTML = `<div class="skeleton skeleton-card"></div>`;

    try {
      const response = await window.ProjectHubAPI.request('/teams/my-teams');
      const teams = response.teams || [];

      // Update stat counter
      const statTeams = document.getElementById('studentStatTeams');
      if (statTeams) statTeams.textContent = teams.length;

      if (teams.length === 0) {
        container.innerHTML = `
          <div class="glass-card" style="padding: 3rem; text-align: center;">
            <div style="font-size: 2.5rem; margin-bottom: 0.75rem;">🛡️</div>
            <h3>You have not joined any project squads yet</h3>
            <p style="color: var(--text-secondary); margin-top: 0.5rem; max-width: 500px; margin-left: auto; margin-right: auto;">
              Explore <strong>Active Projects</strong> to start a new squad, or check <strong>Team Requests</strong> to accept invitations from peer leaders.
            </p>
            <button class="btn btn-primary" style="margin-top: 1.5rem;" onclick="StudentDashboard.switchModule('active-projects')">
              Browse Active Projects →
            </button>
          </div>`;
        return;
      }

      container.innerHTML = teams.map(t => `
        <div class="glass-card tilt-3d animate-fade-in-up" style="padding: 1.85rem; margin-bottom: 1.5rem;">
          <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem;">
            <div>
              <span class="badge badge-blue">Squad Status: ${t.status}</span>
              <h3 style="font-size: 1.45rem; font-weight: 800; margin-top: 0.35rem;">${t.teamName}</h3>
              <p style="color: var(--color-primary); font-size: 0.92rem; font-weight: 600;">Project: ${t.projectTitle}</p>
            </div>
            <div style="text-align: right;">
              <span style="font-family: var(--font-mono); font-size: 1.4rem; font-weight: 700; color: var(--color-emerald);">${t.progress ? t.progress.completionPercentage : 20}%</span>
              <div style="font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase;">Milestone Velocity</div>
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.45rem;">
              <span>Current Phase: <strong>${t.progress ? t.progress.status : 'DEVELOPMENT'}</strong></span>
              <span>Milestone: <strong>${t.progress ? t.progress.currentMilestone : 'Sprint Delivery'}</strong></span>
            </div>
            <div style="height: 8px; background: rgba(255,255,255,0.06); border-radius: var(--radius-full); overflow: hidden;">
              <div style="width: ${t.progress ? t.progress.completionPercentage : 20}%; height: 100%; background: linear-gradient(90deg, #3B82F6, #10B981, #06B6D4, #3B82F6); background-size: 200% auto; animation: velocityFlow 4s linear infinite; box-shadow: 0 0 12px rgba(16, 185, 129, 0.4); border-radius: var(--radius-full); transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);"></div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.85rem;">
            <h4 style="font-size: 0.92rem; font-weight: 700;">Squad Members (${(t.members || []).length} / ${t.teamSizeLimit || 4}):</h4>
            <button class="btn btn-secondary btn-sm" onclick="StudentDashboard.switchModule('available-students')">+ Invite More Peers</button>
          </div>

          <div style="display: flex; flex-wrap: wrap; gap: 0.85rem;">
            ${(t.members || []).map(m => `
              <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.65rem 1rem; background: rgba(255,255,255,0.04); border: 1px solid var(--border-color); border-radius: var(--radius-md);">
                <img src="${m.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover;">
                <div>
                  <div style="font-size: 0.86rem; font-weight: 700;">${m.name}</div>
                  <div style="font-size: 0.74rem; color: var(--color-primary); font-weight: 600;">${m.role}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `).join('');

      if (window.ThreeDEngine) window.ThreeDEngine.refreshCardTilt();
    } catch (err) {
      console.error(err);
    }
  },

  // --------------------------------------------------------------------------
  // MODULE 6: MY PROFILE, SYNC & QUERIES
  // --------------------------------------------------------------------------
  loadMyProfile() {
    const user = window.ProjectHubAPI.getUser();
    if (!user) return;

    const nameEl = document.getElementById('profileName');
    if (nameEl) nameEl.textContent = user.fullName;

    const usnEl = document.getElementById('profileUsn');
    if (usnEl) usnEl.textContent = user.usn;

    const cohortEl = document.getElementById('profileCohort');
    if (cohortEl) cohortEl.textContent = `${user.department} • Year ${user.year} • Section ${user.section}`;

    const bioEl = document.getElementById('profileBio');
    if (bioEl) bioEl.value = user.bio || '';
    
    const skillContainer = document.getElementById('profileSkillList');
    if (skillContainer) {
      skillContainer.innerHTML = (user.skills || []).map(s => `<span class="skill-chip matched">${s}</span>`).join('');
    }
  },

  async saveProfileUpdates() {
    const user = window.ProjectHubAPI.getUser();
    if (!user) return;

    const bio = document.getElementById('profileBio').value.trim();
    try {
      const res = await window.ProjectHubAPI.request('/students/profile', {
        method: 'PUT',
        body: JSON.stringify({ studentId: user.id, bio, skills: user.skills })
      });

      if (res.success && res.user) {
        window.ProjectHubAPI.setUser(res.user);
        window.ProjectHubApp.showToast('Profile credentials saved to live database!', 'success');
      } else {
        window.ProjectHubApp.showToast('Profile updated locally.', 'info');
      }
    } catch (err) {
      user.bio = bio;
      window.ProjectHubAPI.setUser(user);
      window.ProjectHubApp.showToast('Profile saved.', 'success');
    }
  },

  // --------------------------------------------------------------------------
  // RAISE FACULTY INQUIRY 3D MODAL
  // --------------------------------------------------------------------------
  openRaiseQueryModal() {
    const modal = document.getElementById('modalRaiseQuery');
    if (modal) modal.classList.add('is-open');
  },

  closeRaiseQueryModal() {
    const modal = document.getElementById('modalRaiseQuery');
    if (modal) modal.classList.remove('is-open');
  },

  async submitRaiseQuery() {
    const subject = document.getElementById('querySubjectInput').value.trim();
    const queryText = document.getElementById('queryDetailsInput').value.trim();

    if (!subject || !queryText) {
      window.ProjectHubApp.showToast('Please provide both inquiry subject and description.', 'error');
      return;
    }

    const btn = document.getElementById('btnSubmitQuery');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Submitting...';
    }

    try {
      const res = await window.ProjectHubAPI.request('/queries', {
        method: 'POST',
        body: JSON.stringify({ subject, queryText })
      });

      window.ProjectHubApp.showToast('Inquiry submitted to Faculty Admin successfully!', 'success');
      this.closeRaiseQueryModal();

      document.getElementById('querySubjectInput').value = '';
      document.getElementById('queryDetailsInput').value = '';

      if (window.ProjectHubApp.fetchNotifications) {
        window.ProjectHubApp.fetchNotifications();
      }
    } catch (err) {
      window.ProjectHubApp.showToast(err.message || 'Failed to submit query.', 'error');
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Submit Query →';
      }
    }
  }
};

window.StudentDashboard = StudentDashboard;
