import SignInForm from "@/features/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sistem Tempahan",
  description: "Sistem Tempahan Bilik",
};

export default function SignIn() {
  return <SignInForm />;
}
