import prisma from '../config/db.js';

/**
 * GET /jobs
 * Description: List job opportunities posted within the user's college network.
 */
export const getJobs = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId;

    if (!collegeId) {
      return res.status(403).json({
        success: false,
        message: 'College context required to view jobs.',
      });
    }

    const { search } = req.query;

    const where = { collegeId };
    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { location: { contains: term, mode: 'insensitive' } },
        { description: { contains: term, mode: 'insensitive' } },
      ];
    }

    const jobs = await prisma.job.findMany({
      where,
      orderBy: { postedAt: 'desc' },
      include: {
        college: {
          select: { id: true, name: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs.',
      error: error.message,
    });
  }
};

/**
 * POST /jobs
 * Description: Post a new job or internship opportunity.
 * Accessible to any authenticated member (students, alumni, admin).
 */
export const createJob = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId;
    const { title, company, location, description, applyLink } = req.body;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID is required to post a job opportunity.',
      });
    }

    if (!title || !company) {
      return res.status(400).json({
        success: false,
        message: 'Job title and company name are required.',
      });
    }

    const job = await prisma.job.create({
      data: {
        collegeId,
        title: title.trim(),
        company: company.trim(),
        location: location?.trim() || null,
        description: description?.trim() || null,
        applyLink: applyLink?.trim() || null,
        postedByEmail: req.user.email,
        postedByRole: req.user.role,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Job posting published successfully.',
      data: job,
    });
  } catch (error) {
    console.error('Error posting job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create job posting.',
      error: error.message,
    });
  }
};
