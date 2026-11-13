/** Puts text on the clipboard. Returns false when the browser refuses (no permission, or an insecure page). */
const copyText = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

export default copyText;
