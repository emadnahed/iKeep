// Centralized configuration with environment variable validation
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is required');
  process.exit(1);
}

module.exports = {
  JWT_SECRET,
};
