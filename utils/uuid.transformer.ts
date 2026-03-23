export const toUUID = (id: string): string =>
  id.length === 32
    ? `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`
    : id;

export const uuidTransformer = {
  to: (uuid: string | null) => uuid ? Buffer.from(uuid.replace(/-/g, ""), "hex") : null,
  from: (bin: Buffer | string | null) => {
    if (!bin) return null;
    if (typeof bin === "string") return bin;
    const hex = bin.toString("hex");
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20),
    ].join("-");
  },
};
