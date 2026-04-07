export const getBaseType = (glassType: string) => {
  if (glassType.includes("COLOURED")) return "COLOURED";
  if (glassType.includes("PRINTED")) return "PRINTED";
  if (glassType.includes("MIRROR") && !glassType.includes("ANTIQUE")) return "MIRROR";
  if (glassType.includes("ANTIQUE")) return "ANTIQUE_MIRROR";
  if (glassType.includes("CLEAR")) return "CLEAR";

  return "UNKNOWN";
};