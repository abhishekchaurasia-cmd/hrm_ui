import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  }

  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    userId: string;
    role: string;
    accessToken: string;
    refreshToken: string;
    provider?: string;
  }
}
