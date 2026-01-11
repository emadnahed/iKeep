const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ikeeper';

// Connection options for high concurrency and resilience
const connectionOptions = {
    maxPoolSize: 50,           // Max connections in pool
    minPoolSize: 10,           // Min connections to maintain
    serverSelectionTimeoutMS: 5000,  // Timeout for server selection
    socketTimeoutMS: 45000,    // Socket timeout
    family: 4,                 // Use IPv4
    retryWrites: true,         // Retry failed writes
    retryReads: true,          // Retry failed reads
};

// Retry configuration
const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Connect to MongoDB with exponential backoff retry logic
 * @param {number} retryCount - Current retry attempt
 * @returns {Promise<void>}
 */
const connectWithRetry = async (retryCount = 0) => {
    try {
        await mongoose.connect(mongoURI, connectionOptions);
        console.log('✅ Connected to MongoDB successfully');
        console.log(`   Pool size: ${connectionOptions.minPoolSize}-${connectionOptions.maxPoolSize}`);

        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected. Attempting to reconnect...');
            setTimeout(() => connectWithRetry(0), INITIAL_RETRY_DELAY);
        });

        mongoose.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });

    } catch (err) {
        console.error(`❌ MongoDB connection attempt ${retryCount + 1} failed:`, err.message);

        if (retryCount < MAX_RETRIES) {
            const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount); // Exponential backoff
            console.log(`   Retrying in ${delay / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return connectWithRetry(retryCount + 1);
        } else {
            console.error('❌ Max retries reached. Could not connect to MongoDB.');
            throw err;
        }
    }
};

/**
 * Gracefully close MongoDB connection
 * @returns {Promise<void>}
 */
const closeConnection = async () => {
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed gracefully');
    } catch (err) {
        console.error('❌ Error closing MongoDB connection:', err.message);
        throw err;
    }
};

/**
 * Get connection health status
 * @returns {Object} Health status object
 */
const getHealthStatus = () => {
    const state = mongoose.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting',
    };

    return {
        status: states[state] || 'unknown',
        connected: state === 1,
        host: mongoose.connection.host || null,
        name: mongoose.connection.name || null,
    };
};

module.exports = {
    connectToMongo: connectWithRetry,
    closeConnection,
    getHealthStatus,
};