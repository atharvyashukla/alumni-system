/**
 * Middleware to enforce multi-tenant data isolation by collegeId.
 * Guarantees that users cannot query or mutate data outside their assigned college.
 */
export const enforceTenantScope = (req, res, next) => {
  try {
    // 1. Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for tenant-scoped resources.',
      });
    }

    const userCollegeId = req.user.collegeId;
    const requestedCollegeId = req.query.collegeId || req.body.collegeId;

    // Super admin can access any college if specified
    if (req.user.role === 'super_admin' && requestedCollegeId) {
      req.collegeId = requestedCollegeId;
      return next();
    }

    // Regular users must have an assigned college
    if (!userCollegeId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You must be associated with a college to access this data.',
        onboardingStage: 'needs_college',
      });
    }

    // If client passes a collegeId in query or body, it MUST match the user's assigned college
    if (requestedCollegeId && requestedCollegeId !== userCollegeId) {
      return res.status(403).json({
        success: false,
        message: 'Cross-tenant violation: You do not have permission to access data belonging to another college.',
      });
    }

    // Set resolved collegeId on request object for downstream controllers
    req.collegeId = userCollegeId;
    next();
  } catch (error) {
    console.error('Tenant scope middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to resolve tenant security boundary.',
      error: error.message,
    });
  }
};
