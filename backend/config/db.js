/**
 * ============================================================================
 * PROJECTHUB AI - DUAL-MODE DATABASE ADAPTER
 * Connects to PostgreSQL if configured, or uses high-speed in-memory store
 * pre-seeded with production test data for instant evaluation.
 * ============================================================================
 */

const { v4: uuidv4 } = require('uuid');

// In-Memory Seed Store
const memoryStore = {
  skills: [
    { id: 'sk-01', name: 'React', category: 'Frontend' },
    { id: 'sk-02', name: 'Next.js', category: 'Frontend' },
    { id: 'sk-03', name: 'Tailwind CSS', category: 'Frontend' },
    { id: 'sk-04', name: 'TypeScript', category: 'Frontend' },
    { id: 'sk-05', name: 'Node.js', category: 'Backend' },
    { id: 'sk-06', name: 'Express.js', category: 'Backend' },
    { id: 'sk-07', name: 'Java', category: 'Backend' },
    { id: 'sk-08', name: 'Spring Boot', category: 'Backend' },
    { id: 'sk-09', name: 'Python', category: 'Backend' },
    { id: 'sk-10', name: 'FastAPI', category: 'Backend' },
    { id: 'sk-11', name: 'PostgreSQL', category: 'Database' },
    { id: 'sk-12', name: 'MongoDB', category: 'Database' },
    { id: 'sk-14', name: 'PyTorch', category: 'AI_ML' },
    { id: 'sk-17', name: 'Docker', category: 'Cloud_DevOps' },
    { id: 'sk-20', name: 'Figma', category: 'Design' },
    { id: 'sk-21', name: 'UI/UX Prototyping', category: 'Design' },
    { id: 'sk-22', name: 'Solidity', category: 'Blockchain' }
  ],

  admins: [
    {
      id: 'adm-01',
      fullName: 'Dr. Ramesh Kumar',
      email: 'admin.cse@college.edu',
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h', // Password@123
      department: 'CSE',
      role: 'HOD'
    },
    {
      id: 'adm-02',
      fullName: 'Prof. Sarah Chen',
      email: 'sarah.chen@college.edu',
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h',
      department: 'CSE',
      role: 'FACULTY_ADMIN'
    }
  ],

  students: [
    {
      id: 'stu-01',
      usn: '1MS21CS001',
      fullName: 'Alex Morgan',
      email: 'alex.morgan@college.edu',
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h',
      department: 'CSE',
      year: 3,
      section: 'A',
      experienceLevel: 'Advanced',
      bio: 'Full-stack developer passionate about distributed systems and cloud microservices.',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      availabilityStatus: 'AVAILABLE',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker']
    },
    {
      id: 'stu-02',
      usn: '1MS21CS042',
      fullName: 'Rohit Sharma',
      email: 'rohit.sharma@college.edu',
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h',
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
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h',
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
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h',
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
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h',
      department: 'CSE',
      year: 3,
      section: 'A',
      experienceLevel: 'Beginner',
      bio: 'Backend explorer passionate about Java Spring Boot and relational database design.',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      availabilityStatus: 'AVAILABLE',
      skills: ['Java', 'Spring Boot', 'PostgreSQL']
    },
    {
      id: 'stu-06',
      usn: '1MS21CS199',
      fullName: 'Ananya Gupta',
      email: 'ananya.g@college.edu',
      passwordHash: '$2a$10$wK1k6a.sH8j6iK4u5y3QcOzR8B6PjVbK1e4tS2x3g1a2s3d4f5g6h',
      department: 'CSE',
      year: 3,
      section: 'B',
      experienceLevel: 'Advanced',
      bio: 'Cloud architect exploring Kubernetes clustering and CI/CD automated deployments.',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      availabilityStatus: 'AVAILABLE',
      skills: ['Docker', 'Kubernetes', 'Python']
    }
  ],

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
      createdByAdminId: 'adm-02',
      facultyCreator: 'Prof. Sarah Chen',
      createdAt: '2026-11-01T10:00:00Z'
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
      createdByAdminId: 'adm-01',
      facultyCreator: 'Dr. Ramesh Kumar',
      createdAt: '2026-11-02T11:30:00Z'
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
      createdByAdminId: 'adm-02',
      facultyCreator: 'Prof. Sarah Chen',
      createdAt: '2026-11-03T09:15:00Z'
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
      createdByAdminId: 'adm-01',
      facultyCreator: 'Dr. Ramesh Kumar',
      createdAt: '2026-11-04T14:20:00Z'
    }
  ],

  teams: [
    {
      id: 'team-01',
      projectId: 'proj-01',
      teamName: 'NeuralMatrix',
      leaderId: 'stu-03',
      status: 'FORMING',
      members: [
        { studentId: 'stu-03', role: 'Leader & ML Lead', joinedAt: '2026-11-05T12:00:00Z' },
        { studentId: 'stu-02', role: 'Frontend Engineer', joinedAt: '2026-11-06T15:30:00Z' }
      ]
    },
    {
      id: 'team-02',
      projectId: 'proj-02',
      teamName: 'CloudPioneers',
      leaderId: 'stu-01',
      status: 'FORMING',
      members: [
        { studentId: 'stu-01', role: 'Leader & Full-Stack Architect', joinedAt: '2026-11-07T09:00:00Z' }
      ]
    }
  ],

  requests: [
    {
      id: 'req-01',
      senderId: 'stu-01',
      receiverId: 'stu-03',
      teamId: 'team-01',
      projectId: 'proj-01',
      type: 'JOIN_TEAM',
      status: 'PENDING',
      message: 'Hi Priya! I have extensive React and Node.js production experience. I would love to build the frontend and API gateway for your AI Resume Analyzer.',
      createdAt: '2026-11-10T14:00:00Z'
    },
    {
      id: 'req-02',
      senderId: 'stu-01',
      receiverId: 'stu-04',
      teamId: 'team-02',
      projectId: 'proj-02',
      type: 'INVITE_STUDENT',
      status: 'PENDING',
      message: 'Hey Kavya, we are building the CloudPioneers microservices dashboard and need your UI/UX prototyping skills!',
      createdAt: '2026-11-11T16:45:00Z'
    },
    {
      id: 'req-03',
      senderId: 'stu-05',
      receiverId: 'stu-01',
      teamId: 'team-02',
      projectId: 'proj-02',
      type: 'JOIN_TEAM',
      status: 'ACCEPTED',
      message: 'Hello Alex, I can assist with Java Spring Boot backend services and database schema setup.',
      createdAt: '2026-11-09T11:20:00Z'
    }
  ],

  projectProgress: [
    {
      id: 'prog-01',
      projectId: 'proj-01',
      teamId: 'team-01',
      status: 'DEVELOPMENT',
      completionPercentage: 55,
      currentMilestone: 'Transformer Pipeline & Embeddings Integration',
      milestoneDeadline: '2026-11-30',
      notes: 'Resume parser completed. Vector search indexing via Pinecone currently being integrated.',
      updatedAt: '2026-11-18T10:00:00Z'
    },
    {
      id: 'prog-02',
      projectId: 'proj-02',
      teamId: 'team-02',
      status: 'PLANNING',
      completionPercentage: 25,
      currentMilestone: 'Architecture Diagram & Service Contracts Approval',
      milestoneDeadline: '2026-12-05',
      notes: 'Swagger OpenAPI schemas agreed upon. Spring Boot scaffold setup.',
      updatedAt: '2026-11-19T14:30:00Z'
    }
  ],

  queries: [
    {
      id: 'q-01',
      studentId: 'stu-01',
      projectId: 'proj-01',
      subject: 'Dataset licensing for ATS models',
      queryText: 'Are we allowed to use the Kaggle Resume Corpus v3 for pre-training our ATS scoring model?',
      category: 'TECHNICAL',
      adminReply: 'Yes Alex, open-access academic datasets on Kaggle are pre-approved for capstone evaluation.',
      status: 'RESOLVED',
      repliedByAdminId: 'adm-02',
      createdAt: '2026-11-12T09:00:00Z',
      updatedAt: '2026-11-13T10:30:00Z'
    },
    {
      id: 'q-02',
      studentId: 'stu-03',
      projectId: 'proj-01',
      subject: 'GPU cluster allocation request',
      queryText: 'We need access to the college NVIDIA A100 GPU cluster for token embedding fine-tuning.',
      category: 'TECHNICAL',
      adminReply: null,
      status: 'OPEN',
      repliedByAdminId: null,
      createdAt: '2026-11-20T16:00:00Z',
      updatedAt: '2026-11-20T16:00:00Z'
    }
  ],

  notifications: [
    {
      id: 'notif-01',
      userId: 'stu-01',
      userType: 'STUDENT',
      title: 'New Team Request Received',
      message: 'David Miller requested to join CloudPioneers.',
      link: '/requests',
      isRead: false,
      createdAt: '2026-11-09T11:25:00Z'
    },
    {
      id: 'notif-02',
      userId: 'stu-01',
      userType: 'STUDENT',
      title: 'Query Resolved',
      message: 'Prof. Sarah Chen replied to your dataset query.',
      link: '/queries',
      isRead: true,
      createdAt: '2026-11-13T10:35:00Z'
    }
  ]
};

module.exports = {
  memoryStore,
  uuidv4
};
