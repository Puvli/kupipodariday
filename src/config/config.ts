export default () => ({
    port: parseInt(process.env.PORT) || 3000,
    db: {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT) || 5432,
      type: 'postgres',
      username: process.env.DB_USERNAME || 'student',
      password: process.env.DB_PASSWORD || 'student',
      databaseName: process.env.DB_NAME || 'kupipodariday',
    },
    JWT_Secret: process.env.JWT_SECRET || 'anotherSecretKey',
  });
  