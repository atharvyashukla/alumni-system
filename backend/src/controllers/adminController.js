import prisma from '../config/db.js';

/**
 * GET /admin/users?collegeId=...
 * Description: List all users registered under a college with their roles and profiles.
 * Access: Admin only.
 */
export const getCollegeUsers = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId || req.query.collegeId;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId is required.',
      });
    }

    const { role, search } = req.query;

    const where = { collegeId };

    if (role) {
      where.role = role.toLowerCase();
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { fullName: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        provider: true,
        collegeId: true,
        createdAt: true,
        studentProfile: true,
        alumniProfile: true,
      },
    });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve college user roster.',
      error: error.message,
    });
  }
};

/**
 * PATCH /alumni/:id/verify
 * Description: Verify or unverify an alumni account (sets isVerified: true/false).
 * Access: Admin only.
 */
export const toggleAlumniVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;
    const collegeId = req.collegeId || req.user?.collegeId;

    const existingAlumni = await prisma.alumniProfile.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, email: true } },
      },
    });

    if (!existingAlumni) {
      return res.status(404).json({
        success: false,
        message: 'Alumni profile not found.',
      });
    }

    // Cross-tenant protection: admin can only verify alumni in their college
    if (req.user.role !== 'super_admin' && existingAlumni.collegeId !== collegeId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only verify alumni within your affiliated institution.',
      });
    }

    // If isVerified is explicitly passed in body as boolean, use that, otherwise toggle current value
    const newStatus = typeof isVerified === 'boolean' ? isVerified : !existingAlumni.isVerified;

    const updatedAlumni = await prisma.alumniProfile.update({
      where: { id },
      data: { isVerified: newStatus },
      include: {
        user: { select: { fullName: true, email: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Alumni ${updatedAlumni.user.fullName} is now ${newStatus ? 'Verified (Medallion Active)' : 'Unverified'}.`,
      data: updatedAlumni,
    });
  } catch (error) {
    console.error('Error toggling alumni verification:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update alumni verification status.',
      error: error.message,
    });
  }
};
