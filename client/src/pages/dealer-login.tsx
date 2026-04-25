import { useEffect } from "react";

export default function DealerLogin() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return null;
}
