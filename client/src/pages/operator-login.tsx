import { useEffect } from "react";

export default function OperatorLogin() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return null;
}
