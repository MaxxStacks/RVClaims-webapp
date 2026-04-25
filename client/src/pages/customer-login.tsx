import { useEffect } from "react";

export default function CustomerLogin() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return null;
}
