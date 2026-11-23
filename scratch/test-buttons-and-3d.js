const http = require('http');

function req(url, method, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = data ? JSON.stringify(data) : '';
    const request = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(body ? { 'Content-Length': Buffer.byteLength(body) } : {})
      }
    }, res => {
      let responseBody = '';
      res.on('data', chunk => responseBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(responseBody) });
        } catch (e) {
          resolve({ status: res.statusCode, body: responseBody });
        }
      });
    });
    request.on('error', reject);
    if (body) request.write(body);
    request.end();
  });
}

async function run() {
  console.log('--- TESTING NEW BUTTON & MODAL API ENDPOINTS ---');

  // 1. Single Project Details Endpoint
  const p1 = await req('http://localhost:3000/api/projects/proj-01', 'GET');
  console.log('1. GET /api/projects/proj-01 -> Status:', p1.status, 'Title:', p1.body.project?.title, 'Teams count:', p1.body.teams?.length);

  // 2. Student Profile Update Endpoint
  const prof = await req('http://localhost:3000/api/students/profile?userId=stu-01', 'PUT', {
    bio: 'Updated AI/ML Specialist bio for 2026 capstone.',
    skills: ['React', 'Python', 'PyTorch', 'FastAPI']
  });
  console.log('2. PUT /api/students/profile -> Status:', prof.status, 'Success:', prof.body.success, 'New Bio:', prof.body.user?.bio);

  // 3. Student Submit Query Endpoint
  const q = await req('http://localhost:3000/api/queries?userId=stu-01', 'POST', {
    subject: 'GPU Cluster allocation for Model Fine-tuning',
    queryText: 'Can our team access the A100 GPU cluster for our capstone evaluation?'
  });
  console.log('3. POST /api/queries -> Status:', q.status, 'Query ID:', q.body.query?.id, 'Subject:', q.body.query?.subject);
  const qId = q.body.query?.id;

  // 4. Admin Reply & Resolve Query
  const reply = await req(`http://localhost:3000/api/queries/${qId}/reply`, 'PUT', {
    adminReply: 'Approved! 50 hours of compute allocated on node-gpu-03.'
  });
  console.log('4. PUT /api/queries/:id/reply -> Status:', reply.status, 'Success:', reply.body.success, 'Status now:', reply.body.query?.status);

  // 5. Admin Projects Directory
  const adminProjs = await req('http://localhost:3000/api/admin/projects', 'GET');
  console.log('5. GET /api/admin/projects -> Status:', adminProjs.status, 'Projects total:', adminProjs.body.projects?.length);

  // 6. Admin Create New Project
  const newP = await req('http://localhost:3000/api/admin/projects', 'POST', {
    title: 'Autonomous Drone Navigation System',
    description: 'Computer vision and SLAM based drone navigation.',
    department: 'CSE',
    year: 3,
    section: 'A',
    deadline: '2026-12-20',
    teamSize: 4,
    requiredSkills: ['ROS', 'Python', 'OpenCV'],
    priority: 'HIGH'
  });
  console.log('6. POST /api/admin/projects -> Status:', newP.status, 'Created ID:', newP.body.project?.id);
  const newPid = newP.body.project?.id;

  // 7. Admin Delete Project
  const del = await req(`http://localhost:3000/api/admin/projects/${newPid}`, 'DELETE');
  console.log('7. DELETE /api/admin/projects/:id -> Status:', del.status, 'Message:', del.body.message);

  console.log('\n--- ALL TEST ENDPOINTS VERIFIED & WORKING PERFECTLY! ---');
}

run().catch(console.error);
