import prisma from '../config/db.js';

/**
 * GET /events
 * Description: List events scoped to the user's college.
 */
export const getEvents = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId;

    if (!collegeId) {
      return res.status(403).json({
        success: false,
        message: 'College context required to view events.',
      });
    }

    const events = await prisma.event.findMany({
      where: { collegeId },
      orderBy: { eventDate: 'asc' },
      include: {
        college: {
          select: { id: true, name: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve events.',
      error: error.message,
    });
  }
};

/**
 * POST /events
 * Description: Create an event for the college.
 * Access: Admin only (enforced by requireRole('admin', 'super_admin')).
 */
export const createEvent = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId;
    const { title, description, eventDate } = req.body;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'College ID is required to create an event.',
      });
    }

    if (!title || !eventDate) {
      return res.status(400).json({
        success: false,
        message: 'Title and eventDate are required.',
      });
    }

    const parsedDate = new Date(eventDate);
    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid eventDate format. Provide a valid ISO 8601 date.',
      });
    }

    const event = await prisma.event.create({
      data: {
        collegeId,
        title: title.trim(),
        description: description?.trim() || null,
        eventDate: parsedDate,
        createdBy: req.user.email,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Event created successfully.',
      data: event,
    });
  } catch (error) {
    console.error('Error creating event:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create event.',
      error: error.message,
    });
  }
};
