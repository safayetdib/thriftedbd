import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Customer from "@/models/Customer";

function readCredential(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      id: "admin",
      name: "Admin",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = readCredential(credentials?.email);
        const password = readCredential(credentials?.password);
        if (!email || !password) return null;

        await connectDB();
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return null;

        const isValid = await user.comparePassword(password);
        if (!isValid) return null;

        return { id: user._id.toString(), email: user.email, role: "admin" };
      },
    }),
    Credentials({
      id: "customer",
      name: "Customer",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = readCredential(credentials?.email);
        const password = readCredential(credentials?.password);
        if (!email || !password) return null;

        await connectDB();
        const customer = await Customer.findOne({ email: email.toLowerCase() });
        if (!customer) return null;

        const isValid = await customer.comparePassword(password);
        if (!isValid) return null;

        return {
          id: customer._id.toString(),
          email: customer.email,
          name: customer.name,
          role: "customer",
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
});
