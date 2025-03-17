module.exports = {
  apps : [
    {
      name: 'api',
      script: 'apps/api.js',
      instances: 1, // single thread
      autorestart: true,
      output: 'logs/api.log',
      error: 'logs/api-error.log',
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      max_size: '10M',
      retain: 5,
      env: {
        NODE_ENV: "local", // 기본 환경
      },
      env_development: {
        NODE_ENV: "development",
      },
      env_production: {
        NODE_ENV: "production",
      },
      env_local: {
        NODE_ENV: "local",
      },
    },
  ],
};
