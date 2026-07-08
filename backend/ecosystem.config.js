module.exports = {
  apps: [
    {
      name: 'coreitbd-api',
      script: 'dist/src/main.js',
      cwd: '/home/foysal/apps/core-it/backend',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      max_memory_restart: '400M',
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
