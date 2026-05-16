import { redirect } from "next/navigation";

/** Ancienne URL — redirection vers /artivision */
export default function AppLegacyRedirect() {
  redirect("/artivision");
}
