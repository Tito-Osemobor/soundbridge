import { useEffect } from "react";
import { useRouter } from "next/router";

const OAuthBridge = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;

    const { platformId, success, error } = router.query;

    // Validate required params
    if (!platformId) {
      console.warn("Missing platformId in query.");
      return;
    }

    // Prepare message to send to opener
    const message = {
      type: "OAUTH_RESULT",
      platformId,
      status: success === "true" ? "success" : "error",
      error: success === "true" ? null : error,
    };

    // Only send message if opened by another window
    if (window.opener) {
      window.opener.postMessage(message, window.location.origin);
    }

    // Close the popup window after posting
    window.close();
  }, [router]);

  return (
    <main style={{ textAlign: "center", marginTop: "2rem" }}>
      <p>Completing your connection...</p>
    </main>
  );
};

export default OAuthBridge;
