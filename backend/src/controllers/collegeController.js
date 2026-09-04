import prisma from '../config/db.js';
import { inMemoryUsers } from './authController.js';

const DEMO_STARTER_COLLEGES = [
  {
    id: 'csjmu-demo-id',
    name: 'Chhatrapati Shahu Ji Maharaj University (CSJMU)',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    domain: 'csjmu.ac.in',
    createdAt: new Date().toISOString(),
    _count: { users: 3, alumniProfiles: 3, studentProfiles: 1 },
  },
  {
    id: 'iitd-demo-id',
    name: 'Indian Institute of Technology Delhi (IITD)',
    city: 'New Delhi',
    state: 'Delhi',
    domain: 'iitd.ac.in',
    createdAt: new Date().toISOString(),
    _count: { users: 0, alumniProfiles: 0, studentProfiles: 0 },
  },
  {
    id: 'bits-demo-id',
    name: 'Birla Institute of Technology and Science (BITS Pilani)',
    city: 'Pilani',
    state: 'Rajasthan',
    domain: 'pilani.bits-pilani.ac.in',
    createdAt: new Date().toISOString(),
    _count: { users: 0, alumniProfiles: 0, studentProfiles: 0 },
  },
  {
    id: 'nitk-demo-id',
    name: 'National Institute of Technology Karnataka (NITK)',
    city: 'Surathkal',
    state: 'Karnataka',
    domain: 'nitk.edu.in',
    createdAt: new Date().toISOString(),
    _count: { users: 0, alumniProfiles: 0, studentProfiles: 0 },
  },
];

/**
 * GET /colleges
 * Description: List all registered colleges for the college selector/search dropdown.
 */
export const getAllColleges = async (req, res) => {
  try {
    const { search } = req.query;

    const whereClause = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { city: { contains: search, mode: 'insensitive' } },
            { state: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const colleges = await prisma.college.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        city: true,
        state: true,
        domain: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            alumniProfiles: true,
            studentProfiles: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    if (colleges.length > 0) {
      return res.status(200).json({
        success: true,
        count: colleges.length,
        data: colleges,
      });
    }

    // If database is empty, return starter colleges
    const filtered = search
      ? DEMO_STARTER_COLLEGES.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.city.toLowerCase().includes(search.toLowerCase())
        )
      : DEMO_STARTER_COLLEGES;

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
    });
  } catch (error) {
    console.warn('⚠️ DB query failed in getAllColleges, using starter institutions:', error.message);
    const { search } = req.query;
    const filtered = search
      ? DEMO_STARTER_COLLEGES.filter((c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.city.toLowerCase().includes(search.toLowerCase())
        )
      : DEMO_STARTER_COLLEGES;

    return res.status(200).json({
      success: true,
      count: filtered.length,
      data: filtered,
      isDemoFallback: true,
    });
  }
};

/**
 * POST /colleges
 * Description: Register a new college.
 */
export const createCollege = async (req, res) => {
  try {
    const { name, city, state, domain } = req.body;

    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'College name is required and cannot be empty.',
      });
    }

    const trimmedName = name.trim();

    try {
      const existingCollege = await prisma.college.findFirst({
        where: {
          name: {
            equals: trimmedName,
            mode: 'insensitive',
          },
        },
      });

      if (existingCollege) {
        return res.status(409).json({
          success: false,
          message: `A college with the name "${trimmedName}" is already registered.`,
        });
      }

      const newCollege = await prisma.college.create({
        data: {
          name: trimmedName,
          city: city?.trim() || null,
          state: state?.trim() || null,
          domain: domain?.trim()?.toLowerCase() || null,
        },
      });

      return res.status(201).json({
        success: true,
        message: 'College registered successfully.',
        data: newCollege,
      });
    } catch (dbErr) {
      console.warn('DB creation failed, saving to demo colleges list:', dbErr.message);
      const newDemoCollege = {
        id: `college-${Date.now()}`,
        name: trimmedName,
        city: city?.trim() || 'Campus',
        state: state?.trim() || 'India',
        domain: domain?.trim()?.toLowerCase() || null,
        createdAt: new Date().toISOString(),
        _count: { users: 1, alumniProfiles: 0, studentProfiles: 1 },
      };
      DEMO_STARTER_COLLEGES.unshift(newDemoCollege);
      return res.status(201).json({
        success: true,
        message: 'College registered successfully (Demo Mode).',
        data: newDemoCollege,
      });
    }
  } catch (error) {
    console.error('Error registering college:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to register college.',
      error: error.message,
    });
  }
};

/**
 * POST /users/me/college
 * Description: Attach the logged-in user to a chosen collegeId.
 */
export const attachUserCollege = async (req, res) => {
  try {
    const { collegeId } = req.body;
    const userId = req.user?.id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required: User ID could not be identified.',
      });
    }

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId is required.',
      });
    }

    try {
      const college = await prisma.college.findUnique({
        where: { id: collegeId },
      });

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { collegeId },
        include: { college: true },
      });

      return res.status(200).json({
        success: true,
        message: 'User successfully attached to college.',
        data: updatedUser,
      });
    } catch (dbErr) {
      console.warn('DB update failed in attachUserCollege, using in-memory update:', dbErr.message);
      const matchedCollege =
        DEMO_STARTER_COLLEGES.find((c) => c.id === collegeId) || {
          id: collegeId,
          name: 'Chhatrapati Shahu Ji Maharaj University (CSJMU)',
          city: 'Kanpur',
          state: 'Uttar Pradesh',
        };

      if (req.user) {
        req.user.collegeId = collegeId;
        req.user.college = matchedCollege;
        if (inMemoryUsers.has(req.user.email?.toLowerCase())) {
          const mem = inMemoryUsers.get(req.user.email.toLowerCase());
          mem.collegeId = collegeId;
          mem.college = matchedCollege;
        }
      }

      return res.status(200).json({
        success: true,
        message: 'User successfully attached to college (Demo Mode).',
        data: {
          id: userId,
          collegeId,
          college: matchedCollege,
        },
      });
    }
  } catch (error) {
    console.error('Error attaching college to user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to assign college to user.',
      error: error.message,
    });
  }
};
