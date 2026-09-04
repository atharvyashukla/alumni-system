import jwt from 'jsonwebtoken';

/**
 * Generates a signed JWT token containing user identity and tenant context
 */
export const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    collegeId: user.collegeId || null,
  };

  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

/**
 * Verifies a JWT token and returns decoded payload
 */
export const verifyToken = (token) => {
  const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production_12345';
  return jwt.verify(token, secret);
};
