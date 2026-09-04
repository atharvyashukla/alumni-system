import prisma from '../config/db.js';
import { matchAlumniWithGemini } from '../services/geminiService.js';

/**
 * POST /mentorship-requests
 * Description: Student submits a mentorship request to an alumni.
 */
export const createMentorshipRequest = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId;
    const { alumniId, message } = req.body;

    if (!collegeId) {
      return res.status(403).json({
        success: false,
        message: 'College context required.',
      });
    }

    if (!alumniId) {
      return res.status(400).json({
        success: false,
        message: 'alumniId is required.',
      });
    }

    // Verify alumni exists in this college
    const alumni = await prisma.alumniProfile.findFirst({
      where: { id: alumniId, collegeId },
      include: { user: true },
    });

    if (!alumni) {
      return res.status(404).json({
        success: false,
        message: 'The requested alumni mentor could not be found within your college network.',
      });
    }

    // Check if a pending request already exists between this student and alumni
    const existingRequest = await prisma.mentorshipRequest.findFirst({
      where: {
        collegeId,
        studentEmail: req.user.email,
        alumniId,
        status: 'pending',
      },
    });

    if (existingRequest) {
      return res.status(409).json({
        success: false,
        message: 'You already have a pending mentorship request with this alumni.',
        data: existingRequest,
      });
    }

    const mentorshipRequest = await prisma.mentorshipRequest.create({
      data: {
        collegeId,
        studentEmail: req.user.email,
        studentName: req.user.fullName,
        alumniId,
        message: message?.trim() || null,
        status: 'pending',
      },
      include: {
        alumni: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Mentorship request submitted successfully.',
      data: mentorshipRequest,
    });
  } catch (error) {
    console.error('Error creating mentorship request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create mentorship request.',
      error: error.message,
    });
  }
};

/**
 * GET /mentorship-requests
 * Description: Retrieve mentorship requests (as student or as alumni).
 * Supports ?asStudent=true or ?asAlumni=true
 */
export const getMentorshipRequests = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId;
    const { asStudent, asAlumni } = req.query;

    if (!collegeId) {
      return res.status(403).json({
        success: false,
        message: 'College context required.',
      });
    }

    let where = { collegeId };

    if (asStudent === 'true' || req.user.role === 'student') {
      where.studentEmail = req.user.email;
    } else if (asAlumni === 'true' || req.user.role === 'alumni') {
      // Find alumni profile for current user
      const alumniProfile = await prisma.alumniProfile.findUnique({
        where: { userId: req.user.id },
      });

      if (!alumniProfile) {
        return res.status(200).json({
          success: true,
          count: 0,
          data: [],
        });
      }

      where.alumniId = alumniProfile.id;
    }

    const requests = await prisma.mentorshipRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        alumni: {
          include: {
            user: {
              select: { fullName: true, email: true },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    console.error('Error retrieving mentorship requests:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mentorship requests.',
      error: error.message,
    });
  }
};

/**
 * PATCH /mentorship-requests/:id
 * Description: Accept or decline a mentorship request.
 */
export const updateMentorshipRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const collegeId = req.collegeId || req.user?.collegeId;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "accepted" or "declined".',
      });
    }

    const request = await prisma.mentorshipRequest.findUnique({
      where: { id },
      include: {
        alumni: true,
      },
    });

    if (!request || request.collegeId !== collegeId) {
      return res.status(404).json({
        success: false,
        message: 'Mentorship request not found in your college.',
      });
    }

    // Permission check: caller must be target alumni or admin
    const isTargetAlumni = request.alumni.userId === req.user.id;
    const isAdmin = ['admin', 'super_admin'].includes(req.user.role);

    if (!isTargetAlumni && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to respond to this request.',
      });
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id },
      data: { status },
      include: {
        alumni: {
          include: { user: { select: { fullName: true, email: true } } },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Mentorship request has been ${status}.`,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating mentorship request:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update mentorship request.',
      error: error.message,
    });
  }
};

/**
 * POST /mentorship/suggest
 * Description: AI Mentor Matching using Google Gemini API.
 * Takes { message, branch, collegeId }, retrieves verified alumni, and returns top 3 matches with reasons.
 */
export const suggestMentorsWithAI = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId || req.body.collegeId;
    const { message, branch } = req.body;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId is required for AI mentor matching.',
      });
    }

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message or describe your career interests.',
      });
    }

    // Fetch verified alumni for this college
    const verifiedAlumni = await prisma.alumniProfile.findMany({
      where: {
        collegeId,
        isVerified: true,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        college: {
          select: {
            name: true,
          },
        },
      },
    });

    if (verifiedAlumni.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No verified alumni found in this college network yet. As alumni get verified by administrators, AI recommendations will appear.',
        suggestions: [],
      });
    }

    // Call Gemini matching logic
    const suggestions = await matchAlumniWithGemini({
      message,
      branch: branch || req.user?.studentProfile?.branch,
      alumniList: verifiedAlumni,
    });

    return res.status(200).json({
      success: true,
      count: suggestions.length,
      suggestions,
    });
  } catch (error) {
    console.error('Error in AI mentor suggestions:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate AI mentor suggestions.',
      error: error.message,
    });
  }
};
