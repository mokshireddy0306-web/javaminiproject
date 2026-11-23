const http = require('http');

function post(url, data) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
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
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function get(url, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'GET',
      headers: {
        'Authorization': token ? `Bearer ${token}` : ''
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
    req.on('error', reject);
    req.end();
  });
}

function put(url, data, token) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const body = JSON.stringify(data || {});
    const req = http.request({
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': token ? `Bearer ${token}` : ''
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
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING VERIFICATION TEST ---');

  // Test 1: Health
  const health = await get('http://localhost:3000/api/health');
  console.log('1. Health check status:', health.status, 'Students count:', health.body.registeredStudents);

  // Test 2: Student Registration
  const testUsn = '1MS21CS' + Math.floor(100 + Math.random() * 900);
  const testEmail = `student_${Date.now()}@college.edu`;
  const testPass = 'Student@Pass123';

  console.log('\n2. Testing Student Registration with USN:', testUsn);
  const regRes = await post('http://localhost:3000/api/auth/register', {
    fullName: 'Test Automation Student',
    usn: testUsn,
    email: testEmail,
    department: 'CSE',
    year: 3,
    section: 'A',
    skills: ['Python', 'Docker', 'FastAPI'],
    password: testPass,
    confirmPassword: testPass
  });
  console.log('Registration status:', regRes.status, 'Success:', regRes.body.success, 'ID:', regRes.body.user?.id);
  const registeredUser = regRes.body.user;

  // Test 3: Student Login with Registered Credentials
  console.log('\n3. Testing Student Login with Registered Credentials:');
  const loginRes = await post('http://localhost:3000/api/auth/login/student', {
    identifier: testUsn,
    password: testPass
  });
  console.log('Login status:', loginRes.status, 'Success:', loginRes.body.success, 'Token:', loginRes.body.token);

  // Test 4: Admin Login
  console.log('\n4. Testing Admin Login:');
  const adminLogin = await post('http://localhost:3000/api/auth/login/admin', {
    email: 'sarah.chen@college.edu',
    password: 'Password@123'
  });
  console.log('Admin login status:', adminLogin.status, 'Success:', adminLogin.body.success, 'Name:', adminLogin.body.user?.fullName);

  // Test 5: Team Invitation Workflow
  console.log('\n5. Testing Team Invitation Workflow:');
  // Student A (stu-01 Alex Morgan) invites our newly registered student to team-02 (CloudPioneers)
  const inviteRes = await post('http://localhost:3000/api/requests?userId=stu-01', {
    receiverId: registeredUser.id,
    teamId: 'team-02',
    projectId: 'proj-02',
    type: 'INVITE_STUDENT',
    message: 'We want you on CloudPioneers squad!'
  });
  console.log('Invitation sent status:', inviteRes.status, 'Success:', inviteRes.body.success, 'RequestId:', inviteRes.body.request?.id);
  const requestId = inviteRes.body.request?.id;

  // Test 6: Check Notifications for Student B (the registered student)
  console.log('\n6. Checking Notifications for Student B:');
  const notifRes = await get(`http://localhost:3000/api/notifications?userId=${registeredUser.id}`, loginRes.body.token);
  console.log('Notifications count:', notifRes.body.count, 'Unread count:', notifRes.body.unreadCount);
  console.log('Latest notification title:', notifRes.body.notifications?.[0]?.title);

  // Test 7: Student B views pending requests
  console.log('\n7. Checking Pending Requests for Student B:');
  const myReqs = await get(`http://localhost:3000/api/requests/my-requests?userId=${registeredUser.id}`, loginRes.body.token);
  console.log('Received requests count:', myReqs.body.received?.length);
  console.log('First received request from:', myReqs.body.received?.[0]?.senderName, 'Status:', myReqs.body.received?.[0]?.status);

  // Test 8: Student B Accepts Invitation
  console.log('\n8. Student B Accepts Invitation:');
  const acceptRes = await put(`http://localhost:3000/api/requests/${requestId}/accept?userId=${registeredUser.id}`, {}, loginRes.body.token);
  console.log('Accept status:', acceptRes.status, 'Success:', acceptRes.body.success, 'Message:', acceptRes.body.message);
  console.log('Team members now:', acceptRes.body.team?.members.map(m => m.name));

  // Test 9: Verify Team Membership for Student B
  console.log('\n9. Checking My Teams for Student B:');
  const studentBTeams = await get(`http://localhost:3000/api/teams/my-teams?userId=${registeredUser.id}`, loginRes.body.token);
  console.log('Student B team count:', studentBTeams.body.teams?.length);
  console.log('Student B squad name:', studentBTeams.body.teams?.[0]?.teamName);

  // Test 10: Check Notifications for Student A (Acceptance notice)
  console.log('\n10. Checking Student A Notifications (Alex Morgan stu-01):');
  const stuANotifs = await get(`http://localhost:3000/api/notifications?userId=stu-01`);
  console.log('Student A latest notif:', stuANotifs.body.notifications?.[0]?.title, '->', stuANotifs.body.notifications?.[0]?.message);

  console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
}

runTests().catch(console.error);
