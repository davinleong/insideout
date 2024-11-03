const messages = {
  auth: {
    loginSuccess: "Successful login for",
    loginFailed: "Login failed",
    notAuthenticated: "User is not authenticated.",
    tokenMissing: "Token is missing.",
    invalidToken: "Invalid token provided.",
  },
  fetch: {
    apiStatsError: "Failed to fetch API stats data.",
    userStatsError: "Failed to fetch user stats data.",
    unknownError: "An unknown error occurred.",
  },
  table: {
    noApiStats: "No API stats available.",
    noUserStats: "No user stats available.",
  },
  dashboard: {
    title: "Admin Dashboard",
    apiStatsTitle: "API Endpoint Stats",
    userStatsTitle: "User API Consumption Stats",
  },
  loading: "Loading data...",
};

export default messages;