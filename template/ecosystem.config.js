module.exports = {
    apps: [
        {
            name: 'oak-template-server',
            script: './scripts/startServer.js',
            instances: '10',
            exec_mode: 'cluster',
            log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
            increment_var: "OAK_INSTANCE_ID",
            env: {
                OAK_PLATFORM: 'server',
                NODE_ENV: 'development',
                OAK_INSTANCE_CNT: 10,
                OAK_INSTANCE_ID: 0,
            },
            env_prod: {
                OAK_PLATFORM: 'server',
                NODE_ENV: 'production',
                OAK_INSTANCE_CNT: 10,
                OAK_INSTANCE_ID: 0,
            },
            env_staging: {
                OAK_PLATFORM: 'server',
                NODE_ENV: 'staging',
                OAK_INSTANCE_CNT: 10,
                OAK_INSTANCE_ID: 0,
            },
        },
    ],
};