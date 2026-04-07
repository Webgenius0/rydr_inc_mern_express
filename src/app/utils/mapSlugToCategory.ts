const mapSlugToCategory = (slug: string) => {
    const text = slug.toLowerCase();

    if (text.includes("coloured")) return "COLOURED";
    if (text.includes("printed")) return "PRINTED";
    if (text.includes("mirror") && !text.includes("antique")) return "MIRROR";
    if (text.includes("antique")) return "ANTIQUE_MIRROR";

    return "UNKNOWN";
};

export default mapSlugToCategory;