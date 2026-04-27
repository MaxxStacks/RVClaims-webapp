import { SignIn } from "@clerk/clerk-react";

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
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/portal-router"
      />
    </div>
  );
}
