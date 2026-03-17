export const uuidTransformer = {
  to: (uuid: string) => Buffer.from(uuid.replace(/-/g, ""), "hex"),
  from: (bin: Buffer | null) => {
    if (!bin) return null;
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
