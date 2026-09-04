import prisma from '../config/db.js';

/**
 * POST /users/me/role
 * Description: Set role ("student" or "alumni") for the logged-in user, only once.
 */
export const setUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const validRoles = ['student', 'alumni', 'admin'];
    if (!role || !validRoles.includes(role.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Must be one of: ${validRoles.join(', ')}.`,
      });
    }

    const normalizedRole = role.toLowerCase();

    // Check existing role
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Role can only be set once (cannot be changed if already student or alumni)
    if (user.role && user.role !== 'pending' && user.role !== 'unassigned') {
      return res.status(409).json({
        success: false,
        message: `Role is already locked as "${user.role}" and cannot be changed.`,
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: normalizedRole },
      include: {
        college: true,
        studentProfile: true,
        alumniProfile: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Role successfully updated to "${normalizedRole}".`,
      data: updatedUser,
    });
  } catch (error) {
    console.error('Set User Role Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update user role.',
      error: error.message,
    });
  }
};

/**
 * POST /students/me
 * Description: Create the logged-in user's StudentProfile.
 */
export const createStudentProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: `Only users with the "student" role can create a student profile. Current role: "${user.role}".`,
      });
    }

    if (!user.collegeId) {
      return res.status(400).json({
        success: false,
        message: 'You must select an affiliated college before creating your student profile.',
      });
    }

    const {
      rollNumber,
      branch,
      currentYear,
      enrollmentYear,
      expectedGraduationYear,
      phone,
    } = req.body;

    if (!branch || !currentYear || !enrollmentYear || !expectedGraduationYear) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: branch, currentYear, enrollmentYear, and expectedGraduationYear are required.',
      });
    }

    // Check if student profile already exists
    const existingProfile = await prisma.studentProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'A student profile already exists for this account. Use update instead.',
        data: existingProfile,
      });
    }

    const studentProfile = await prisma.studentProfile.create({
      data: {
        userId: user.id,
        collegeId: user.collegeId,
        rollNumber: rollNumber?.trim() || null,
        branch: branch.trim(),
        currentYear: currentYear.trim(),
        enrollmentYear: parseInt(enrollmentYear, 10),
        expectedGraduationYear: parseInt(expectedGraduationYear, 10),
        phone: phone?.trim() || null,
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true },
        },
        college: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Student profile created successfully.',
      data: studentProfile,
    });
  } catch (error) {
    console.error('Create Student Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create student profile.',
      error: error.message,
    });
  }
};

/**
 * POST /alumni/me
 * Description: Create the logged-in user's AlumniProfile.
 */
export const createAlumniProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.id) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    if (user.role !== 'alumni') {
      return res.status(403).json({
        success: false,
        message: `Only users with the "alumni" role can create an alumni profile. Current role: "${user.role}".`,
      });
    }

    if (!user.collegeId) {
      return res.status(400).json({
        success: false,
        message: 'You must select an affiliated college before creating your alumni profile.',
      });
    }

    const {
      batchYear,
      branch,
      currentCompany,
      designation,
      sector,
      city,
      phone,
      linkedinUrl,
    } = req.body;

    if (!batchYear || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: batchYear and branch are required.',
      });
    }

    // Check if alumni profile already exists
    const existingProfile = await prisma.alumniProfile.findUnique({
      where: { userId: user.id },
    });

    if (existingProfile) {
      return res.status(409).json({
        success: false,
        message: 'An alumni profile already exists for this account.',
        data: existingProfile,
      });
    }

    const alumniProfile = await prisma.alumniProfile.create({
      data: {
        userId: user.id,
        collegeId: user.collegeId,
        batchYear: parseInt(batchYear, 10),
        branch: branch.trim(),
        currentCompany: currentCompany?.trim() || null,
        designation: designation?.trim() || null,
        sector: sector?.trim() || 'Other',
        city: city?.trim() || null,
        phone: phone?.trim() || null,
        linkedinUrl: linkedinUrl?.trim() || null,
        isVerified: false, // Default unverified until approved by administrator
      },
      include: {
        user: {
          select: { id: true, email: true, fullName: true, role: true },
        },
        college: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Alumni profile created successfully.',
      data: alumniProfile,
    });
  } catch (error) {
    console.error('Create Alumni Profile Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create alumni profile.',
      error: error.message,
    });
  }
};
