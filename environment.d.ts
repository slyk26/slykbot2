declare global {
    namespace NodeJS {
      interface ProcessEnv {
        // discord
        APPLICATION_ID: number;
        DISCORD_TOKEN: string;
        // reddit
        REDDIT_CLIENT_ID: string;
        REDDIT_CLIENT_SECRET: string;
        REDDIT_REFRESH_TOKEN: string;
      }
    }
  } export {};