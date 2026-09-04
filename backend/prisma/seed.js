import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial colleges data...');

  const colleges = [
    {
      name: 'Chhatrapati Shahu Ji Maharaj University (CSJMU)',
      city: 'Kanpur',
      state: 'Uttar Pradesh',
      domain: 'csjmu.ac.in',
    },
    {
      name: 'Indian Institute of Technology Delhi (IITD)',
      city: 'New Delhi',
      state: 'Delhi',
      domain: 'iitd.ac.in',
    },
    {
      name: 'Birla Institute of Technology and Science (BITS Pilani)',
      city: 'Pilani',
      state: 'Rajasthan',
      domain: 'pilani.bits-pilani.ac.in',
    },
    {
      name: 'National Institute of Technology Karnataka (NITK)',
      city: 'Surathkal',
      state: 'Karnataka',
      domain: 'nitk.edu.in',
    },
  ];

  let csjmuId = null;

  for (const college of colleges) {
    let collegeRecord = await prisma.college.findFirst({
      where: { name: { equals: college.name, mode: 'insensitive' } },
    });

    if (!collegeRecord) {
      collegeRecord = await prisma.college.create({ data: college });
      console.log(`Created college: ${collegeRecord.name}`);
    } else {
      console.log(`College already exists: ${collegeRecord.name}`);
    }

    if (collegeRecord.name.includes('CSJMU')) {
      csjmuId = collegeRecord.id;
    }
  }

  // Seed sample admin and alumni under CSJMU for testing directory, events, jobs, and mentorship
  if (csjmuId) {
    console.log('Seeding demo users, alumni profiles, events, jobs, and donations under CSJMU...');

    // 1. Admin user
    let adminUser = await prisma.user.findUnique({
      where: { email: 'admin@csjmu.ac.in' },
    });
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@csjmu.ac.in',
          fullName: 'CSJMU Registrar Office',
          role: 'admin',
          provider: 'google',
          collegeId: csjmuId,
        },
      });
      console.log('Created Admin user: admin@csjmu.ac.in');
    }

    // 2. Verified Alumni 1 (Google - CSE)
    let alumniUser1 = await prisma.user.findUnique({
      where: { email: 'priya.sharma@alumni.csjmu.ac.in' },
    });
    if (!alumniUser1) {
      alumniUser1 = await prisma.user.create({
        data: {
          email: 'priya.sharma@alumni.csjmu.ac.in',
          fullName: 'Priya Sharma',
          role: 'alumni',
          provider: 'linkedin',
          collegeId: csjmuId,
          alumniProfile: {
            create: {
              collegeId: csjmuId,
              batchYear: 2019,
              branch: 'Computer Science and Engineering',
              currentCompany: 'Google India',
              designation: 'Senior Software Engineer',
              sector: 'IT/Software',
              city: 'Bengaluru',
              linkedinUrl: 'https://linkedin.com/in/priyasharma-demo',
              isVerified: true,
            },
          },
        },
      });
      console.log('Created Verified Alumni: Priya Sharma');
    }

    // 3. Verified Alumni 2 (Tata Motors - Mech)
    let alumniUser2 = await prisma.user.findUnique({
      where: { email: 'vikram.singh@alumni.csjmu.ac.in' },
    });
    if (!alumniUser2) {
      alumniUser2 = await prisma.user.create({
        data: {
          email: 'vikram.singh@alumni.csjmu.ac.in',
          fullName: 'Vikram Singh',
          role: 'alumni',
          provider: 'google',
          collegeId: csjmuId,
          alumniProfile: {
            create: {
              collegeId: csjmuId,
              batchYear: 2017,
              branch: 'Mechanical Engineering',
              currentCompany: 'Tata Motors',
              designation: 'Lead Propulsion Engineer',
              sector: 'Core Engineering',
              city: 'Pune',
              linkedinUrl: 'https://linkedin.com/in/vikramsingh-demo',
              isVerified: true,
            },
          },
        },
      });
      console.log('Created Verified Alumni: Vikram Singh');
    }

    // 4. Verified Alumni 3 (Microsoft - Cloud & AI)
    let alumniUser3 = await prisma.user.findUnique({
      where: { email: 'rohit.gupta@alumni.csjmu.ac.in' },
    });
    if (!alumniUser3) {
      alumniUser3 = await prisma.user.create({
        data: {
          email: 'rohit.gupta@alumni.csjmu.ac.in',
          fullName: 'Rohit Gupta',
          role: 'alumni',
          provider: 'linkedin',
          collegeId: csjmuId,
          alumniProfile: {
            create: {
              collegeId: csjmuId,
              batchYear: 2018,
              branch: 'Information Technology',
              currentCompany: 'Microsoft',
              designation: 'Principal AI Architect',
              sector: 'IT/Software',
              city: 'Hyderabad',
              linkedinUrl: 'https://linkedin.com/in/rohitgupta-demo',
              isVerified: true,
            },
          },
        },
      });
      console.log('Created Verified Alumni: Rohit Gupta');
    }

    // 5. Sample Event
    const existingEvent = await prisma.event.findFirst({
      where: { collegeId: csjmuId, title: 'Annual Global Alumni Conclave 2026' },
    });
    if (!existingEvent) {
      await prisma.event.create({
        data: {
          collegeId: csjmuId,
          title: 'Annual Global Alumni Conclave 2026',
          description: 'Join faculty, distinguished alumni, and graduating students for our annual homecoming and networking evening.',
          eventDate: new Date('2026-11-14T10:00:00Z'),
          createdBy: 'admin@csjmu.ac.in',
        },
      });
      console.log('Created sample Event.');
    }

    // 6. Sample Job
    const existingJob = await prisma.job.findFirst({
      where: { collegeId: csjmuId, title: 'Software Engineer - Distributed Systems' },
    });
    if (!existingJob) {
      await prisma.job.create({
        data: {
          collegeId: csjmuId,
          title: 'Software Engineer - Distributed Systems',
          company: 'Google India',
          location: 'Bengaluru / Hybrid',
          description: 'Looking for enthusiastic alumni or fresh graduates proficient in distributed algorithms and modern cloud architecture.',
          applyLink: 'https://careers.google.com',
          postedByEmail: 'priya.sharma@alumni.csjmu.ac.in',
          postedByRole: 'alumni',
        },
      });
      console.log('Created sample Job posting.');
    }

    // 7. Sample Donations
    const donationCount = await prisma.donation.count({ where: { collegeId: csjmuId } });
    if (donationCount === 0) {
      await prisma.donation.createMany({
        data: [
          {
            collegeId: csjmuId,
            donorName: 'Vikram Singh',
            donorEmail: 'vikram.singh@alumni.csjmu.ac.in',
            batchYear: 2017,
            amount: 250000,
            purpose: 'Advanced Robotics Lab Equipment',
          },
          {
            collegeId: csjmuId,
            donorName: 'Priya Sharma',
            donorEmail: 'priya.sharma@alumni.csjmu.ac.in',
            batchYear: 2019,
            amount: 150000,
            purpose: 'Women in STEM Merit Scholarship',
          },
          {
            collegeId: csjmuId,
            donorName: 'Rajesh Khanna',
            donorEmail: 'rajesh.khanna@alumni.csjmu.ac.in',
            batchYear: 1998,
            amount: 500000,
            purpose: 'Campus Innovation Incubation Fund',
          },
        ],
      });
      console.log('Created sample Donations and Leaderboard.');
    }
  }

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
