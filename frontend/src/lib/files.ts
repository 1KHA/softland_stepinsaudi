// Document access (backend risk R-12).
//
// Documents are no longer served by `express.static('/uploads')`; they come
// from the authenticated `GET /files/:id` route. An `<a href>` cannot send an
// Authorization header, so the flow is:
//
//   1. POST /files/:id/token   (with the session token, as a normal API call)
//   2. navigate to GET /files/:id?t=<token>
//
// The `?t=` token lives 60 seconds and is scoped to that one document, so the
// session token itself never appears in a URL, a log line or browser history.

import { API_URL } from "../config";
import { authHeaders } from "./session";

export async function getDocumentDownloadUrl(
  documentId: number | string
): Promise<string> {
  const res = await fetch(`${API_URL}/files/${documentId}/token`, {
    method: "POST",
    headers: authHeaders(),
  });

  if (!res.ok) {
    throw new Error(`Could not authorise download (${res.status})`);
  }

  const data = await res.json();

  if (!data || !data.token) {
    throw new Error("Download token missing from response");
  }

  return `${API_URL}/files/${documentId}?t=${encodeURIComponent(data.token)}`;
}

// `mode: "view"` opens a new tab, `mode: "download"` navigates the current one.
// Either way the response carries Content-Disposition: attachment, so the page
// is not replaced.
//
// The blank tab is opened synchronously, before the await, because a popup
// opened after an async hop is blocked by default.
export async function openDocument(
  documentId: number | string,
  mode: "view" | "download" = "view"
): Promise<void> {
  const tab = mode === "view" ? window.open("", "_blank") : null;

  try {
    const url = await getDocumentDownloadUrl(documentId);

    if (tab) {
      tab.location.href = url;
    } else {
      window.location.href = url;
    }
  } catch (error) {
    if (tab) {
      tab.close();
    }

    console.error("Document download failed", error);
    alert("Could not open this document. Please try again.");
  }
}
