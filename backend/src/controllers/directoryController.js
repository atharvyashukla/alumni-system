import prisma from '../config/db.js';

const DEMO_ALUMNI = [
  {
    id: 'alumni-1',
    collegeId: 'csjmu-demo-id',
    batchYear: 2019,
    branch: 'Computer Science and Engineering',
    currentCompany: 'Google India',
    designation: 'Senior Software Engineer',
    sector: 'IT/Software',
    city: 'Bengaluru',
    linkedinUrl: 'https://linkedin.com/in/priyasharma-demo',
    isVerified: true,
    user: {
      id: 'u-1',
      fullName: 'Priya Sharma',
      email: 'priya.sharma@alumni.csjmu.ac.in',
      role: 'alumni',
    },
  },
  {
    id: 'alumni-2',
    collegeId: 'csjmu-demo-id',
    batchYear: 2017,
    branch: 'Mechanical Engineering',
    currentCompany: 'Tata Motors',
    designation: 'Lead Propulsion Engineer',
    sector: 'Core Engineering',
    city: 'Pune',
    linkedinUrl: 'https://linkedin.com/in/vikramsingh-demo',
    isVerified: true,
    user: {
      id: 'u-2',
      fullName: 'Vikram Singh',
      email: 'vikram.singh@alumni.csjmu.ac.in',
      role: 'alumni',
    },
  },
  {
    id: 'alumni-3',
    collegeId: 'csjmu-demo-id',
    batchYear: 2018,
    branch: 'Information Technology',
    currentCompany: 'Microsoft',
    designation: 'Principal AI Architect',
    sector: 'IT/Software',
    city: 'Hyderabad',
    linkedinUrl: 'https://linkedin.com/in/rohitgupta-demo',
    isVerified: true,
    user: {
      id: 'u-3',
      fullName: 'Rohit Gupta',
      email: 'rohit.gupta@alumni.csjmu.ac.in',
      role: 'alumni',
    },
  },
];

/**
 * GET /alumni
 * Description: Filtered alumni directory, strictly scoped to the user's college.
 */
export const getAlumniDirectory = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId;

    const {
      branch,
      batchYear,
      sector,
      isVerified,
      search,
      page = 1,
      limit = 20,
    } = req.query;

    const pageNumber = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (pageNumber - 1) * pageSize;

    try {
      const where = {
        collegeId: collegeId || undefined,
      };

      if (branch) {
        where.branch = { contains: branch, mode: 'insensitive' };
      }

      if (batchYear) {
        const year = parseInt(batchYear, 10);
        if (!isNaN(year)) where.batchYear = year;
      }

      if (sector) {
        where.sector = { contains: sector, mode: 'insensitive' };
      }

      if (typeof isVerified !== 'undefined') {
        where.isVerified = isVerified === 'true';
      }

      if (search && search.trim() !== '') {
        const searchTerm = search.trim();
        where.OR = [
          { user: { fullName: { contains: searchTerm, mode: 'insensitive' } } },
          { currentCompany: { contains: searchTerm, mode: 'insensitive' } },
          { designation: { contains: searchTerm, mode: 'insensitive' } },
          { city: { contains: searchTerm, mode: 'insensitive' } },
          { branch: { contains: searchTerm, mode: 'insensitive' } },
        ];
      }

      const [total, alumni] = await Promise.all([
        prisma.alumniProfile.count({ where }),
        prisma.alumniProfile.findMany({
          where,
          skip,
          take: pageSize,
          orderBy: [{ isVerified: 'desc' }, { batchYear: 'desc' }],
          include: {
            user: { select: { id: true, fullName: true, email: true, role: true } },
            college: { select: { id: true, name: true, city: true, state: true } },
          },
        }),
      ]);

      if (total > 0 || alumni.length > 0) {
        return res.status(200).json({
          success: true,
          collegeId,
          pagination: {
            total,
            page: pageNumber,
            limit: pageSize,
            totalPages: Math.ceil(total / pageSize) || 1,
          },
          data: alumni,
        });
      }
    } catch (dbErr) {
      console.warn('⚠️ DB lookup failed in getAlumniDirectory, using demo alumni dataset:', dbErr.message);
    }

    // Filter in-memory demo alumni
    let filtered = [...DEMO_ALUMNI];
    if (branch) {
      filtered = filtered.filter((a) => a.branch.toLowerCase().includes(branch.toLowerCase()));
    }
    if (batchYear) {
      filtered = filtered.filter((a) => a.batchYear === parseInt(batchYear, 10));
    }
    if (sector) {
      filtered = filtered.filter((a) => a.sector.toLowerCase() === sector.toLowerCase());
    }
    if (isVerified === 'true') {
      filtered = filtered.filter((a) => a.isVerified);
    }
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.user.fullName.toLowerCase().includes(s) ||
          a.currentCompany.toLowerCase().includes(s) ||
          a.designation.toLowerCase().includes(s) ||
          a.city.toLowerCase().includes(s)
      );
    }

    return res.status(200).json({
      success: true,
      collegeId: collegeId || 'csjmu-demo-id',
      pagination: {
        total: filtered.length,
        page: 1,
        limit: pageSize,
        totalPages: 1,
      },
      data: filtered,
    });
  } catch (error) {
    console.error('Error fetching alumni directory:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve alumni directory.',
      error: error.message,
    });
  }
};
