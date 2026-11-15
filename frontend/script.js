/**
 * ==============================================================================
 * SMART PROJECT TEAM FORMATION SYSTEM - FRONTEND SCRIPT
 * Production-Grade Client Logic: Validation, Skill Matrix, Micro-Interactions
 * ==============================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Element References ---
  const form = document.getElementById('studentRegistrationForm');
  const btnRegister = document.getElementById('btnRegister');
  const btnReset = document.getElementById('btnReset');
  const progressBar = document.getElementById('progressBar');
  const progressPercent = document.getElementById('progressPercent');

  // Input Fields
  const fullNameInput = document.getElementById('fullName');
  const emailInput = document.getElementById('email');
  const phoneInput = document.getElementById('phone');
  const departmentSelect = document.getElementById('department');
  const academicYearSelect = document.getElementById('academicYear');
  const experienceRadios = document.querySelectorAll('input[name="experienceLevel"]');
  const interestCheckboxes = document.querySelectorAll('input[name="interests"]');
  const termsCheckbox = document.getElementById('termsConsent');

  // Skills Component Elements
  const skillInput = document.getElementById('skillInput');
  const btnAddSkill = document.getElementById('btnAddSkill');
  const activeSkillsList = document.getElementById('activeSkillsList');
  const skillsCountBadge = document.getElementById('skillsCount');
  const quickSkillPills = document.querySelectorAll('.quick-pill');

  // Interests Counter
  const interestsCountBadge = document.getElementById('interestsCount');

  // Success Modal Elements
  const successOverlay = document.getElementById('successOverlay');
  const btnRegisterAnother = document.getElementById('btnRegisterAnother');
  const btnDismissSuccess = document.getElementById('btnDismissSuccess');
  const btnCopyId = document.getElementById('btnCopyId');
  const copyFeedback = document.getElementById('copyFeedback');
  const receiptStudentId = document.getElementById('receiptStudentId');
  const receiptName = document.getElementById('receiptName');
  const receiptDeptYear = document.getElementById('receiptDeptYear');
  const receiptExp = document.getElementById('receiptExp');
  const receiptEmail = document.getElementById('receiptEmail');
  const receiptSkills = document.getElementById('receiptSkills');

  // Toast Container
  const toastContainer = document.getElementById('toastContainer');

  // --- State Management ---
  const state = {
    skills: new Set(),
    interests: new Set(),
    isSubmitting: false,
    touchedFields: new Set()
  };

  // ============================================================================
  // SKILLS COMPONENT LOGIC
  // ============================================================================

  /**
   * Render active skill chips in the DOM
   */
  function renderSkills() {
    activeSkillsList.innerHTML = '';

    if (state.skills.size === 0) {
      activeSkillsList.innerHTML = `<span class="empty-chips-notice">No skills added yet. Type below or choose from suggestions.</span>`;
    } else {
      state.skills.forEach(skill => {
        const chip = document.createElement('div');
        chip.className = 'skill-chip';
        chip.innerHTML = `
          <span>${escapeHtml(skill)}</span>
          <button type="button" class="btn-remove-chip" aria-label="Remove skill ${escapeHtml(skill)}" data-skill="${escapeHtml(skill)}">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        `;
        activeSkillsList.appendChild(chip);
      });
    }

    // Update Counter Badge
    const count = state.skills.size;
    skillsCountBadge.textContent = `${count} added (${count >= 2 ? 'Meets requirement' : 'min 2'})`;
    skillsCountBadge.style.color = count >= 2 ? '#34D399' : '#94A3B8';

    // Sync Quick Suggestion Pills State
    quickSkillPills.forEach(pill => {
      const skillName = pill.getAttribute('data-skill');
      if (state.skills.has(skillName)) {
        pill.classList.add('is-added');
        pill.setAttribute('aria-disabled', 'true');
      } else {
        pill.classList.remove('is-added');
        pill.removeAttribute('aria-disabled');
      }
    });

    // Validate Skills if user has already touched or attempted submit
    if (state.touchedFields.has('skills')) {
      validateSkills();
    }

    updateProgress();
  }

  /**
   * Add a skill to the state
   * @param {string} rawSkill 
   */
  function addSkill(rawSkill) {
    if (!rawSkill) return;
    const trimmed = rawSkill.trim();

    if (trimmed.length < 2) {
      showToast('Skill name must be at least 2 characters.', 'error');
      return;
    }

    // Case-insensitive duplicate check
    const exists = Array.from(state.skills).some(s => s.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`"${trimmed}" has already been added.`, 'error');
      return;
    }

    state.skills.add(trimmed);
    state.touchedFields.add('skills');
    renderSkills();
    skillInput.value = '';
    skillInput.focus();
  }

  /**
   * Remove a skill from the state
   * @param {string} skillName 
   */
  function removeSkill(skillName) {
    state.skills.delete(skillName);
    renderSkills();
  }

  // Handle Enter key on skill input
  skillInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent form submission
      addSkill(skillInput.value);
    }
  });

  // Handle Add Skill Button click
  btnAddSkill.addEventListener('click', () => {
    addSkill(skillInput.value);
  });

  // Handle Removing Skill Chip via event delegation
  activeSkillsList.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-remove-chip');
    if (btn) {
      const skill = btn.getAttribute('data-skill');
      removeSkill(skill);
    }
  });

  // Handle Quick Suggestion Pills
  quickSkillPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const skill = pill.getAttribute('data-skill');
      if (!state.skills.has(skill)) {
        addSkill(skill);
      }
    });
  });

  // ============================================================================
  // AREAS OF INTEREST LOGIC
  // ============================================================================

  function handleInterestChange() {
    state.interests.clear();
    interestCheckboxes.forEach(cb => {
      if (cb.checked) {
        state.interests.add(cb.value);
      }
    });

    const count = state.interests.size;
    interestsCountBadge.textContent = `${count} selected (${count >= 1 ? 'Meets requirement' : 'min 1'})`;
    interestsCountBadge.style.color = count >= 1 ? '#34D399' : '#94A3B8';

    state.touchedFields.add('interests');
    validateInterests();
    updateProgress();
  }

  interestCheckboxes.forEach(cb => {
    cb.addEventListener('change', handleInterestChange);
  });

  // ============================================================================
  // FORM VALIDATION ENGINE
  // ============================================================================

  // Validation Rules
  const validators = {
    fullName: (value) => {
      if (!value || value.trim().length === 0) return 'Full Name is required.';
      if (value.trim().length < 3) return 'Full Name must be at least 3 characters.';
      if (!/^[a-zA-Z\s.'-]+$/.test(value.trim())) return 'Full Name can only contain letters, spaces, and hyphens.';
      return null;
    },

    email: (value) => {
      if (!value || value.trim().length === 0) return 'Institutional email is required.';
      const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
      if (!emailRegex.test(value.trim())) return 'Please enter a valid email address (e.g., student@university.edu).';
      return null;
    },

    phone: (value) => {
      if (!value || value.trim().length === 0) return 'Phone number is required.';
      // Strip formatting characters to count raw digits
      const digits = value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) return 'Phone number must contain 10 to 15 digits.';
      return null;
    },

    department: (value) => {
      if (!value || value.trim() === '') return 'Please select your academic department.';
      return null;
    },

    academicYear: (value) => {
      if (!value || value.trim() === '') return 'Please select your current academic year.';
      return null;
    },

    experienceLevel: () => {
      const selected = document.querySelector('input[name="experienceLevel"]:checked');
      if (!selected) return 'Please choose an experience level.';
      return null;
    },

    skills: () => {
      if (state.skills.size < 2) return 'Please add at least 2 technical skills.';
      return null;
    },

    interests: () => {
      if (state.interests.size < 1) return 'Please select at least 1 domain of interest.';
      return null;
    },

    termsConsent: (checked) => {
      if (!checked) return 'You must consent to algorithmic matching to proceed.';
      return null;
    }
  };

  /**
   * Helper to set input error or success state
   */
  function setFieldValidationState(groupId, errorId, errorMsg) {
    const group = document.getElementById(groupId);
    const errorEl = document.getElementById(errorId);

    if (!group || !errorEl) return;

    if (errorMsg) {
      group.classList.remove('has-success');
      group.classList.add('has-error');
      errorEl.textContent = errorMsg;
      errorEl.style.display = 'block';
    } else {
      group.classList.remove('has-error');
      group.classList.add('has-success');
      errorEl.textContent = '';
      errorEl.style.display = 'none';
    }
  }

  function validateFullName() {
    const error = validators.fullName(fullNameInput.value);
    setFieldValidationState('group-fullName', 'fullNameError', error);
    return !error;
  }

  function validateEmail() {
    const error = validators.email(emailInput.value);
    setFieldValidationState('group-email', 'emailError', error);
    return !error;
  }

  function validatePhone() {
    const error = validators.phone(phoneInput.value);
    setFieldValidationState('group-phone', 'phoneError', error);
    return !error;
  }

  function validateDepartment() {
    const error = validators.department(departmentSelect.value);
    setFieldValidationState('group-department', 'departmentError', error);
    return !error;
  }

  function validateAcademicYear() {
    const error = validators.academicYear(academicYearSelect.value);
    setFieldValidationState('group-academicYear', 'academicYearError', error);
    return !error;
  }

  function validateExperienceLevel() {
    const error = validators.experienceLevel();
    const group = document.getElementById('group-experienceLevel');
    const errorEl = document.getElementById('experienceLevelError');
    if (error) {
      group.classList.add('has-error');
      errorEl.textContent = error;
      errorEl.style.display = 'block';
      return false;
    } else {
      group.classList.remove('has-error');
      errorEl.style.display = 'none';
      return true;
    }
  }

  function validateSkills() {
    const error = validators.skills();
    const group = document.getElementById('group-skills');
    const errorEl = document.getElementById('skillsError');
    if (error) {
      group.classList.add('has-error');
      errorEl.textContent = error;
      errorEl.style.display = 'block';
      return false;
    } else {
      group.classList.remove('has-error');
      errorEl.style.display = 'none';
      return true;
    }
  }

  function validateInterests() {
    const error = validators.interests();
    const group = document.getElementById('group-interests');
    const errorEl = document.getElementById('interestsError');
    if (error) {
      group.classList.add('has-error');
      errorEl.textContent = error;
      errorEl.style.display = 'block';
      return false;
    } else {
      group.classList.remove('has-error');
      errorEl.style.display = 'none';
      return true;
    }
  }

  function validateTerms() {
    const error = validators.termsConsent(termsCheckbox.checked);
    const errorEl = document.getElementById('termsConsentError');
    if (error) {
      errorEl.textContent = error;
      errorEl.style.display = 'block';
      return false;
    } else {
      errorEl.style.display = 'none';
      return true;
    }
  }

  // Real-time Event Listeners
  fullNameInput.addEventListener('input', () => {
    state.touchedFields.add('fullName');
    validateFullName();
    updateProgress();
  });

  emailInput.addEventListener('input', () => {
    state.touchedFields.add('email');
    validateEmail();
    updateProgress();
  });

  phoneInput.addEventListener('input', () => {
    state.touchedFields.add('phone');
    validatePhone();
    updateProgress();
  });

  departmentSelect.addEventListener('change', () => {
    state.touchedFields.add('department');
    validateDepartment();
    updateProgress();
  });

  academicYearSelect.addEventListener('change', () => {
    state.touchedFields.add('academicYear');
    validateAcademicYear();
    updateProgress();
  });

  experienceRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      state.touchedFields.add('experienceLevel');
      validateExperienceLevel();
      updateProgress();
    });
  });

  termsCheckbox.addEventListener('change', () => {
    validateTerms();
  });

  // ============================================================================
  // PROGRESS TRACKER
  // ============================================================================

  function updateProgress() {
    let completedCriteria = 0;
    const totalCriteria = 7;

    if (validators.fullName(fullNameInput.value) === null) completedCriteria++;
    if (validators.email(emailInput.value) === null) completedCriteria++;
    if (validators.phone(phoneInput.value) === null) completedCriteria++;
    if (validators.department(departmentSelect.value) === null) completedCriteria++;
    if (validators.academicYear(academicYearSelect.value) === null) completedCriteria++;
    if (validators.experienceLevel() === null) completedCriteria++;
    if (validators.skills() === null) completedCriteria++;

    const percent = Math.round((completedCriteria / totalCriteria) * 100);
    progressBar.style.width = `${percent}%`;
    progressPercent.textContent = `${percent}%`;

    if (percent === 100) {
      progressPercent.style.color = '#34D399';
    } else {
      progressPercent.style.color = '#3B82F6';
    }
  }

  // ============================================================================
  // FORM SUBMISSION & ASYNC REGISTRATION ENGINE
  // ============================================================================

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (state.isSubmitting) return;

    // Trigger full validation for all fields
    const isNameValid = validateFullName();
    const isEmailValid = validateEmail();
    const isPhoneValid = validatePhone();
    const isDeptValid = validateDepartment();
    const isYearValid = validateAcademicYear();
    const isExpValid = validateExperienceLevel();
    const isSkillsValid = validateSkills();
    const isInterestsValid = validateInterests();
    const isTermsValid = validateTerms();

    const isFormValid = isNameValid && isEmailValid && isPhoneValid &&
                        isDeptValid && isYearValid && isExpValid &&
                        isSkillsValid && isInterestsValid && isTermsValid;

    if (!isFormValid) {
      showToast('Please complete all required fields correctly.', 'error');
      
      // Auto-focus the first invalid field
      const firstInvalidGroup = document.querySelector('.form-group.has-error');
      if (firstInvalidGroup) {
        firstInvalidGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const inputToFocus = firstInvalidGroup.querySelector('input, select');
        if (inputToFocus) inputToFocus.focus();
      }
      return;
    }

    // Set Loading State
    state.isSubmitting = true;
    btnRegister.classList.add('is-loading');
    btnRegister.setAttribute('disabled', 'true');
    btnReset.setAttribute('disabled', 'true');

    // Gather Registration Payload
    const selectedExp = document.querySelector('input[name="experienceLevel"]:checked')?.value || 'Beginner';
    const deptText = departmentSelect.options[departmentSelect.selectedIndex].text;
    const yearText = academicYearSelect.options[academicYearSelect.selectedIndex].text;

    const registrationData = {
      fullName: fullNameInput.value.trim(),
      email: emailInput.value.trim(),
      phone: phoneInput.value.trim(),
      department: deptText,
      academicYear: yearText,
      experienceLevel: selectedExp,
      skills: Array.from(state.skills),
      interests: Array.from(state.interests),
      timestamp: new Date().toISOString()
    };

    try {
      // Simulate High-Performance Algorithm Ingestion & Registration Latency
      await new Promise(resolve => setTimeout(resolve, 1400));

      // Generate Unique Production Student ID (STU-2026-XXXXX)
      const randomSuffix = Math.floor(10000 + Math.random() * 90000);
      const studentId = `STU-2026-X${randomSuffix}`;

      // Populate Success Modal Summary
      receiptStudentId.textContent = studentId;
      receiptName.textContent = registrationData.fullName;
      receiptDeptYear.textContent = `${registrationData.department.split('(')[0].trim()} • ${registrationData.academicYear.split('(')[0].trim()}`;
      receiptExp.textContent = `${getExpIcon(selectedExp)} ${selectedExp}`;
      receiptEmail.textContent = registrationData.email;

      // Populate Skills Chips
      receiptSkills.innerHTML = '';
      registrationData.skills.forEach(skill => {
        const span = document.createElement('span');
        span.className = 'summary-chip';
        span.textContent = skill;
        receiptSkills.appendChild(span);
      });

      // Show Success Modal Overlay
      successOverlay.classList.add('is-active');
      successOverlay.setAttribute('aria-hidden', 'false');

      // Play success chime sound or toast notification
      showToast('Student registered successfully in matching pool!', 'success');

    } catch (err) {
      console.error('Registration Error:', err);
      showToast('An unexpected error occurred while processing registration.', 'error');
    } finally {
      state.isSubmitting = false;
      btnRegister.classList.remove('is-loading');
      btnRegister.removeAttribute('disabled');
      btnReset.removeAttribute('disabled');
    }
  });

  // Helper for experience emoji badge
  function getExpIcon(exp) {
    if (exp === 'Beginner') return '🌱';
    if (exp === 'Intermediate') return '⚡';
    if (exp === 'Advanced') return '🚀';
    return '✨';
  }

  // ============================================================================
  // RESET FORM HANDLING
  // ============================================================================

  function resetForm() {
    form.reset();
    state.skills.clear();
    state.interests.clear();
    state.touchedFields.clear();

    // Clear validation styling
    document.querySelectorAll('.form-group').forEach(group => {
      group.classList.remove('has-error', 'has-success');
    });
    document.querySelectorAll('.error-message').forEach(err => {
      err.style.display = 'none';
      err.textContent = '';
    });

    renderSkills();
    handleInterestChange();
    updateProgress();
    showToast('Form has been reset to defaults.', 'info');
  }

  btnReset.addEventListener('click', () => {
    // Soft confirmation if fields are partially filled
    if (fullNameInput.value || emailInput.value || state.skills.size > 0) {
      if (confirm('Are you sure you want to clear all entered student details?')) {
        resetForm();
      }
    } else {
      resetForm();
    }
  });

  // ============================================================================
  // SUCCESS MODAL INTERACTIONS
  // ============================================================================

  // Register another student
  btnRegisterAnother.addEventListener('click', () => {
    successOverlay.classList.remove('is-active');
    successOverlay.setAttribute('aria-hidden', 'true');
    resetForm();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    fullNameInput.focus();
  });

  // Close & return
  btnDismissSuccess.addEventListener('click', () => {
    successOverlay.classList.remove('is-active');
    successOverlay.setAttribute('aria-hidden', 'true');
  });

  // Copy Registration ID to clipboard
  btnCopyId.addEventListener('click', async () => {
    const textToCopy = receiptStudentId.textContent;
    try {
      await navigator.clipboard.writeText(textToCopy);
      copyFeedback.textContent = 'Copied!';
      btnCopyId.style.borderColor = '#10B981';
      btnCopyId.style.color = '#34D399';

      setTimeout(() => {
        copyFeedback.textContent = 'Copy';
        btnCopyId.style.borderColor = '';
        btnCopyId.style.color = '';
      }, 2000);
    } catch (err) {
      showToast(`Registration ID: ${textToCopy}`, 'info');
    }
  });

  // Keyboard shortcut: Escape closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && successOverlay.classList.contains('is-active')) {
      successOverlay.classList.remove('is-active');
      successOverlay.setAttribute('aria-hidden', 'true');
    }
  });

  // ============================================================================
  // NOTIFICATION TOAST UTILITY
  // ============================================================================

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'error') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F43F5E" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else if (type === 'success') {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else {
      iconSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <span class="toast-icon">${iconSvg}</span>
      <span class="toast-msg">${escapeHtml(message)}</span>
    `;

    toastContainer.appendChild(toast);

    // Auto dismiss after 3.8s
    setTimeout(() => {
      toast.style.animation = 'toastSlideOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Escape HTML utility to prevent XSS
  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Initial Render Execution ---
  renderSkills();
  updateProgress();
});
