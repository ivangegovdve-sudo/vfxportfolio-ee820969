const ABSOLUTE_PROTOCOL = /^(https?:)?\/\//i;

export const resolvePhotoUrl = (photoUrl: string | undefined, fallbackUrl: string): string => {
  const value = photoUrl?.trim();

  if (!value) return fallbackUrl;
  if (value === "/assets/slackPic.png" || value === "assets/slackPic.png") return fallbackUrl;
  if (value.startsWith("data:")) return value;
  if (ABSOLUTE_PROTOCOL.test(value)) return value;
  if (value.startsWith("/")) return value;
  if (value.startsWith("assets/")) return `/${value}`;

  return fallbackUrl;
};
