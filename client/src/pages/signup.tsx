import { SignUp } from "@clerk/clerk-react";

export default function SignupPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f9fc",
      padding: 20,
    }}>
      <SignUp
        routing="path"
        path="/signup"
        signInUrl="/login"
        fallbackRedirectUrl="/portal-router"
      />
    </div>
  );
}
