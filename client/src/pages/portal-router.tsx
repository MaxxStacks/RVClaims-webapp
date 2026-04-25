import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function PortalRouter() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = (user.publicMetadata?.role as string) || "client";

    let target = "/client";
    if (role === "operator_admin" || role === "operator_staff") target = "/operator";
    else if (role === "dealer_owner" || role === "dealer_staff" || role === "technician" || role === "public_bidder" || role === "consignor") target = "/dealer";
    else if (role === "bidder") target = "/bidder";
    else if (role === "client") target = "/client";

    window.location.href = target;
  }, [isLoaded, user]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p>Redirecting to your portal...</p>
    </div>
  );
}
