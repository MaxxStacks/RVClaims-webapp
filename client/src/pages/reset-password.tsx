import { useEffect } from "react";

export default function ResetPassword() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return null;
}
