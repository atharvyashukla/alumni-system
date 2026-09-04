import prisma from '../config/db.js';

/**
 * POST /donations
 * Description: Record a donation toward a college fund or initiative.
 */
export const createDonation = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId || req.body.collegeId;
    const { donorEmail, donorName, batchYear, amount, purpose } = req.body;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId is required to process a donation.',
      });
    }

    const email = req.user?.email || donorEmail;
    const name = req.user?.fullName || donorName;
    const parsedAmount = parseFloat(amount);

    if (!email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Donor name and email are required.',
      });
    }

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Donation amount must be a positive number.',
      });
    }

    if (!purpose || purpose.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Donation purpose is required (e.g. Scholarship Fund, Lab Equipment, Infrastructure).',
      });
    }

    const donation = await prisma.donation.create({
      data: {
        collegeId,
        donorEmail: email.toLowerCase().trim(),
        donorName: name.trim(),
        batchYear: batchYear ? parseInt(batchYear, 10) : null,
        amount: parsedAmount,
        purpose: purpose.trim(),
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Donation processed successfully. Thank you for your generosity!',
      data: donation,
    });
  } catch (error) {
    console.error('Error creating donation:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record donation.',
      error: error.message,
    });
  }
};

/**
 * GET /donations/summary?collegeId=...
 * Description: Returns aggregate total funds raised, total count, and top 10 leaderboard.
 */
export const getDonationsSummary = async (req, res) => {
  try {
    const collegeId = req.collegeId || req.user?.collegeId || req.query.collegeId;

    if (!collegeId) {
      return res.status(400).json({
        success: false,
        message: 'collegeId is required to view donation analytics.',
      });
    }

    // 1. Total statistics
    const aggregate = await prisma.donation.aggregate({
      where: { collegeId },
      _sum: { amount: true },
      _count: { id: true },
      _avg: { amount: true },
    });

    // 2. Top 10 individual contributions leaderboard
    const topDonations = await prisma.donation.findMany({
      where: { collegeId },
      orderBy: { amount: 'desc' },
      take: 10,
      select: {
        id: true,
        donorName: true,
        batchYear: true,
        amount: true,
        purpose: true,
        donatedAt: true,
      },
    });

    // 3. Recent 5 donations
    const recentDonations = await prisma.donation.findMany({
      where: { collegeId },
      orderBy: { donatedAt: 'desc' },
      take: 5,
      select: {
        id: true,
        donorName: true,
        batchYear: true,
        amount: true,
        purpose: true,
        donatedAt: true,
      },
    });

    return res.status(200).json({
      success: true,
      collegeId,
      summary: {
        totalAmount: aggregate._sum.amount || 0,
        totalDonations: aggregate._count.id || 0,
        averageDonation: Math.round(aggregate._avg.amount || 0),
      },
      leaderboard: topDonations,
      recentDonations,
    });
  } catch (error) {
    console.error('Error retrieving donation summary:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve donation summary.',
      error: error.message,
    });
  }
};
