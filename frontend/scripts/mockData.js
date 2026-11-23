/**
 * ============================================================================
 * PROJECTHUB AI - STANDALONE CLIENT MOCK DATA ENGINE
 * Ensures 100% functionality and seamless presentation when opened directly
 * via file:// or when backend is offline.
 * ============================================================================
 */

window.ProjectHubMock = {
  currentUser: {
    id: 'stu-01',
    usn: '1MS21CS001',
    fullName: 'Alex Morgan',
    email: 'alex.morgan@college.edu',
    department: 'CSE',
    year: 3,
    section: 'A',
    experienceLevel: 'Advanced',
    bio: 'Full-stack developer passionate about distributed systems and cloud microservices.',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    availabilityStatus: 'AVAILABLE',
    skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
    role: 'STUDENT'
  },

  projects: [
    {
      id: 'proj-01',
      title: 'AI Resume Analyzer & ATS Score Optimizer',
      description: 'An intelligent platform utilizing LLM embeddings and NLP parsers to analyze candidate resumes against job descriptions, highlighting keyword gaps and formatting bottlenecks.',
      department: 'CSE',
      year: 3,
      section: 'A',
      deadline: '2026-12-15',
      teamSize: 4,
      priority: 'HIGH',
      status: 'PUBLISHED',
      requiredSkills: ['Python', 'PyTorch', 'React', 'FastAPI'],
      facultyCreator: 'Prof. Sarah Chen',
      currentMembers: 2,
      remainingSlots: 2,
      matchScore: 92
    },
    {
      id: 'proj-02',
      title: 'Distributed Event-Driven Microservices Hub',
      description: 'High-throughput asynchronous order processing engine built with Kafka event streams, Redis caching, Spring Boot microservices, and Docker Swarm orchestration.',
      department: 'CSE',
      year: 3,
      section: 'A',
      deadline: '2026-12-20',
      teamSize: 4,
      priority: 'CRITICAL',
      status: 'PUBLISHED',
      requiredSkills: ['Java', 'Spring Boot', 'Docker', 'PostgreSQL'],
      facultyCreator: 'Dr. Ramesh Kumar',
      currentMembers: 1,
      remainingSlots: 3,
      matchScore: 85
    },
    {
      id: 'proj-03',
      title: 'Decentralized Academic Credential Verification Vault',
      description: 'Tamper-proof blockchain smart contract protocol for university transcript issuance, instant third-party employer verification, and zero-knowledge privacy proof generation.',
      department: 'CSE',
      year: 3,
      section: 'A',
      deadline: '2026-12-30',
      teamSize: 3,
      priority: 'MEDIUM',
      status: 'PUBLISHED',
      requiredSkills: ['Solidity', 'React', 'Node.js'],
      facultyCreator: 'Prof. Sarah Chen',
      currentMembers: 0,
      remainingSlots: 3,
      matchScore: 78
    },
    {
      id: 'proj-04',
      title: 'Autonomous Campus Drone Navigation & Delivery',
      description: 'Edge-computed computer vision pipeline for collision-free autonomous indoor and outdoor drone quadcopter navigation across college campus zones.',
      department: 'AIML',
      year: 3,
      section: 'A',
      deadline: '2026-12-28',
      teamSize: 4,
      priority: 'HIGH',
      status: 'PUBLISHED',
      requiredSkills: ['Python', 'PyTorch', 'OpenCV'],
      facultyCreator: 'Dr. Rajesh Nair',
      currentMembers: 0,
      remainingSlots: 4,
      matchScore: 40
    },
    {
      id: 'proj-05',
      title: 'Cloud-Native Healthcare Telemetry System',
      description: 'HIPAA-compliant IoT wearable telemetry ingest system aggregating real-time patient heart rate, ECG, and oxygen levels with automated critical anomaly alerting.',
      department: 'CSE',
      year: 3,
      section: 'B',
      deadline: '2027-01-10',
      teamSize: 4,
      priority: 'MEDIUM',
      status: 'PUBLISHED',
      requiredSkills: ['React', 'Python', 'Docker'],
      facultyCreator: 'Dr. Ramesh Kumar',
      currentMembers: 0,
      remainingSlots: 4,
      matchScore: 65
    }
  ],

  students: [
    {
      id: 'stu-02',
      usn: '1MS21CS042',
      fullName: 'Rohit Sharma',
      email: 'rohit.sharma@college.edu',
      department: 'CSE',
      year: 3,
      section: 'A',
      experienceLevel: 'Intermediate',
      bio: 'Frontend enthusiast specializing in React, Next.js, and interactive motion design.',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      availabilityStatus: 'AVAILABLE',
      skills: ['React', 'Tailwind CSS', 'TypeScript']
    },
    {
      id: 'stu-03',
      usn: '1MS21CS089',
      fullName: 'Priya Sundaram',
      email: 'priya.s@college.edu',
      department: 'CSE',
      year: 3,
      section: 'A',
      experienceLevel: 'Advanced',
      bio: 'Machine Learning researcher working with LLMs, NLP tokenization and PyTorch pipelines.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      availabilityStatus: 'AVAILABLE',
      skills: ['Python', 'PyTorch', 'FastAPI']
    },
    {
      id: 'stu-04',
      usn: '1MS21CS115',
      fullName: 'Kavya Rao',
      email: 'kavya.rao@college.edu',
      department: 'CSE',
      year: 3,
      section: 'A',
      experienceLevel: 'Intermediate',
      bio: 'Product designer & UI/UX specialist who turns complex workflows into intuitive software.',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      availabilityStatus: 'AVAILABLE',
      skills: ['Figma', 'UI/UX Prototyping', 'Tailwind CSS']
    },
    {
      id: 'stu-05',
      usn: '1MS21CS028',
      fullName: 'David Miller',
      email: 'david.m@college.edu',
      department: 'CSE',
      year: 3,
      section: 'A',
      experienceLevel: 'Beginner',
      bio: 'Backend explorer passionate about Java Spring Boot and relational database design.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      availabilityStatus: 'AVAILABLE',
      skills: ['Java', 'Spring Boot', 'PostgreSQL']
    }
  ],

  teams: [
    {
      id: 'team-02',
      projectId: 'proj-02',
      projectTitle: 'Distributed Event-Driven Microservices Hub',
      teamName: 'CloudPioneers',
      leaderId: 'stu-01',
      teamSizeLimit: 4,
      status: 'FORMING',
      members: [
        {
          studentId: 'stu-01',
          name: 'Alex Morgan',
          role: 'Leader & Full-Stack Architect',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          skills: ['React', 'Node.js', 'PostgreSQL', 'Docker']
        }
      ],
      progress: {
        status: 'PLANNING',
        completionPercentage: 25,
        currentMilestone: 'Architecture Diagram & Service Contracts Approval',
        notes: 'API contracts validated. Scaffold initialized.'
      }
    }
  ],

  requests: [
    {
      id: 'req-01',
      senderId: 'stu-05',
      senderName: 'David Miller',
      senderSkills: ['Java', 'Spring Boot'],
      receiverId: 'stu-01',
      receiverName: 'Alex Morgan',
      teamId: 'team-02',
      teamName: 'CloudPioneers',
      projectTitle: 'Distributed Event-Driven Microservices Hub',
      type: 'JOIN_TEAM',
      status: 'PENDING',
      message: 'Hello Alex, I can assist with Java Spring Boot backend services and database schema setup.'
    }
  ],

  queries: [
    {
      id: 'q-01',
      studentId: 'stu-01',
      studentName: 'Alex Morgan',
      studentUsn: '1MS21CS001',
      projectTitle: 'AI Resume Analyzer & ATS Score Optimizer',
      subject: 'Dataset licensing for ATS models',
      queryText: 'Are we allowed to use the Kaggle Resume Corpus v3 for pre-training our ATS scoring model?',
      category: 'TECHNICAL',
      adminReply: 'Yes Alex, open-access academic datasets on Kaggle are pre-approved for capstone evaluation.',
      status: 'RESOLVED',
      repliedByAdminName: 'Prof. Sarah Chen'
    }
  ],

  analytics: {
    kpis: {
      totalProjects: 5,
      activeProjects: 4,
      registeredStudents: 48,
      teamsFormed: 12,
      pendingStudents: 14,
      completedProjects: 2,
      openQueries: 3
    }
  }
};
