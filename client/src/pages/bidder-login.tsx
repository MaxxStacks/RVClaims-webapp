import { useEffect } from "react";

export default function BidderLogin() {
  useEffect(() => {
    window.location.replace("/login");
  }, []);
  return null;
}
