import { SignIn } from "@clerk/clerk-react";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f9fc",
      padding: 20,
    }}>
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/portal-router"
      />
    </div>
  );
}
