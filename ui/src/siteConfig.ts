export const githubUrl= "https://github.com/cb-v4s?tab=repositories";
export const appName = "ghoulies";
export const coreApiUrl = import.meta.env.VITE_API_BASE_URL;
export const wsApiUrl = `${coreApiUrl}/ws`;
export const SecurityHeaders = {
  CSRF: "X-Csrf-Token",
};

export const CSRF_IDENTIFIER_KEY = "_csrf";
export const ACCESS_TOKEN_IDENTIFIER_KEY = "accessToken";
export const REFRESH_TOKEN_IDENTIFIER_KEY = "refreshToken";
export const CONSOLE_STATE_IDENTIFIER_KEY = "_cons_state";