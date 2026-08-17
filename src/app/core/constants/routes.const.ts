export const ROUTES = {
  home: "/",
  signUp: "/sign-up",
  logIn: "/log-in",
  dashboard: "/dashboard",
  friends: "/friends",
  group: (groupId: string) => `/groups/${groupId}`,
  challenge: (groupId: string, challengeId: string) =>
    `/groups/${groupId}/challenges/${challengeId}`,
} as const;
