import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./mongodb-adapter";

// Verify required environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.NEXTAUTH_SECRET) {
  throw new Error('Required environment variables are missing');
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      image?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    sub: string;
    email?: string | null;
    name?: string | null;
    picture?: string | null;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account }) {
      if (!user?.email) {
        console.error('SignIn Callback - No email provided');
        return false;
      }

      console.log('SignIn Callback:', {
        userId: user.id,
        email: user.email,
        provider: account?.provider
      });
      return true;
    },
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        console.log('JWT Callback - Setting user data:', {
          userId: user.id,
          email: user.email
        });
        
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
      }

      // Ensure token has an ID
      if (!token.id && token.sub) {
        console.log('JWT Callback - Using sub as ID');
        token.id = token.sub;
      }

      console.log('JWT Callback - Final token:', {
        id: token.id,
        sub: token.sub,
        email: token.email
      });

      return token;
    },
    async session({ session, token }) {
      console.log('Session Callback - Input:', {
        sessionUser: session?.user,
        token: { id: token.id, sub: token.sub }
      });

      if (session.user) {
        // Ensure user ID is set from token
        session.user.id = token.id || token.sub;
        // Ensure other user properties are set with fallbacks
        session.user.email = token.email || '';  // Provide empty string fallback
        session.user.name = token.name || '';    // Provide empty string fallback
        if (token.picture) {                     // Only set image if it exists
          session.user.image = token.picture;
        }

        console.log('Session Callback - Updated session:', {
          userId: session.user.id,
          email: session.user.email
        });
      }

      return session;
    }
  },
  events: {
    async signIn(message) {
      console.log('SignIn Event:', {
        userId: message.user.id,
        email: message.user.email
      });
    },
    async createUser(message) {
      console.log('CreateUser Event:', {
        userId: message.user.id,
        email: message.user.email
      });
    },
    async session(message) {
      console.log('Session Event:', {
        userId: message.session.user.id,
        email: message.session.user.email
      });
    }
  },
  debug: process.env.NODE_ENV === 'development',
}; 