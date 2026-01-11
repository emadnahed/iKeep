const { connectToMongo, closeConnection: closeDb } = require('./db.js');
const { closeConnection: closeRedis } = require('./middleware/rateLimit');
const app = require('./app');
const os = require('os');

const port = process.env.PORT || 5000;

let server;

/**
 * Graceful shutdown handler
 * @param {string} signal - The signal that triggered shutdown
 */
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  if (server) {
    server.close(async (err) => {
      if (err) {
        console.error('❌ Error during server close:', err);
      } else {
        console.log('✅ HTTP server closed');
      }

      // Close database connections
      try {
        await closeDb();
      } catch (dbErr) {
        console.error('❌ Error closing database:', dbErr);
      }

      // Close Redis connections
      try {
        await closeRedis();
      } catch (redisErr) {
        console.error('❌ Error closing Redis:', redisErr);
      }

      console.log('✅ Graceful shutdown complete');
      process.exit(err ? 1 : 0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('❌ Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

// Register shutdown handlers
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectToMongo();

    // Start HTTP server
    server = app.listen(port, () => {
      console.log(`\n🚀 iKeep backend started`);
      console.log(`   Host: ${os.hostname()}`);
      console.log(`   Port: ${port}`);
      console.log(`   PID: ${process.pid}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Ready to accept connections\n`);
    });

    // Handle server errors
    server.on('error', (err) => {
      console.error('❌ Server error:', err);
      process.exit(1);
    });

  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();