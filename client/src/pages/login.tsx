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
        appearance={{
          variables: { colorPrimary: "#033280" },
          elements: {
            card: { boxShadow: "0 4px 20px rgba(3,50,128,0.08)" },
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/signup"
        fallbackRedirectUrl="/portal-router"
      />
    </div>
  );
}
