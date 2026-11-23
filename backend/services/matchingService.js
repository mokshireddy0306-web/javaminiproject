/**
 * ============================================================================
 * PROJECTHUB AI - SKILL MATCHMAKING SERVICE
 * Algorithmic score calculation for Student-to-Project and Student-to-Team fit.
 * ============================================================================
 */

/**
 * Calculate compatibility percentage between student skills and project requirements
 * @param {Array<string>} studentSkills 
 * @param {Array<string>} projectRequiredSkills 
 * @returns {number} 0 - 100 percentage
 */
function calculateMatchPercentage(studentSkills = [], projectRequiredSkills = []) {
  if (!projectRequiredSkills || projectRequiredSkills.length === 0) return 100;
  if (!studentSkills || studentSkills.length === 0) return 0;

  const normalizedStudent = new Set(studentSkills.map(s => s.toLowerCase().trim()));
  const normalizedRequired = projectRequiredSkills.map(s => s.toLowerCase().trim());

  let matchCount = 0;
  normalizedRequired.forEach(reqSkill => {
    if (normalizedStudent.has(reqSkill)) {
      matchCount++;
    }
  });

  const percentage = Math.round((matchCount / normalizedRequired.length) * 100);
  return percentage;
}

/**
 * Rank and score projects for a specific student based on their skills
 * @param {Object} student 
 * @param {Array<Object>} projects 
 * @returns {Array<Object>} Projects sorted by compatibility
 */
function rankProjectsForStudent(student, projects) {
  const studentSkills = student.skills || [];

  return projects.map(proj => {
    const matchScore = calculateMatchPercentage(studentSkills, proj.requiredSkills || []);
    
    // Identify which skills student possesses and which are missing
    const studentSkillSet = new Set(studentSkills.map(s => s.toLowerCase()));
    const matchedSkills = (proj.requiredSkills || []).filter(s => studentSkillSet.has(s.toLowerCase()));
    const missingSkills = (proj.requiredSkills || []).filter(s => !studentSkillSet.has(s.toLowerCase()));

    return {
      ...proj,
      matchScore,
      matchedSkills,
      missingSkills
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Recommend students for a team to fill missing technical capabilities
 * @param {Array<string>} missingSkills 
 * @param {Array<Object>} availableStudents 
 * @returns {Array<Object>}
 */
function recommendStudentsForMissingSkills(missingSkills = [], availableStudents = []) {
  if (missingSkills.length === 0) return availableStudents;

  return availableStudents.map(student => {
    const studentSkillSet = new Set((student.skills || []).map(s => s.toLowerCase()));
    const complementaryMatches = missingSkills.filter(s => studentSkillSet.has(s.toLowerCase()));
    const complementaryScore = Math.round((complementaryMatches.length / missingSkills.length) * 100);

    return {
      ...student,
      complementaryScore,
      complementaryMatches
    };
  }).sort((a, b) => b.complementaryScore - a.complementaryScore);
}

module.exports = {
  calculateMatchPercentage,
  rankProjectsForStudent,
  recommendStudentsForMissingSkills
};
