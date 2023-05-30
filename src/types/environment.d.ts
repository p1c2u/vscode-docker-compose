export {};

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      COMPOSE_PROJECT_NAME?: string;
    }
  }
}