// import { RATE_CARD } from "./rateCard.util";

export function round2(n: number) {
    return Math.round(n * 100) / 100;
}

// export function calculatePricing(params: {
//     areaM2: number;
//     socketCount: number;
//     largeCutCount: number;
//     fittingRequired: boolean;
//     productPricing: {
//         priceType: "PER_SQM" | "PER_SQFT" | "FIXED";
//         basePrice: number;
//         artworkFee?: number;
//         minCharge?: number;
//     };
// }) {
//     const { areaM2, socketCount, largeCutCount, fittingRequired, productPricing } = params;

//     // base cost
//     let baseCost = 0;

//     if (productPricing.priceType === "FIXED") baseCost = productPricing.basePrice;
//     if (productPricing.priceType === "PER_SQM") baseCost = productPricing.basePrice * areaM2;
//     if (productPricing.priceType === "PER_SQFT") baseCost = productPricing.basePrice * (areaM2 * 10.7639104167);

//     const artworkFee = productPricing.artworkFee ?? 0;

//     const socketCost = socketCount * RATE_CARD.socketUnitPrice;
//     const largeCutCost = largeCutCount * RATE_CARD.largeCutUnitPrice;
// ;

//     // min charge
//     if (productPricing.minCharge && subtotal < productPricing.minCharge) {
//         subtotal = productPricing.minCharge;
//     }

//     const vat = subtotal * (RATE_CARD.vatPercent / 100);
//     const total = subtotal + vat;

//     return {
//         baseCost: round2(baseCost),
//         artworkFee: round2(artworkFee),
//         socketCost: round2(socketCost),
//         largeCutCost: round2(largeCutCost),
//         subtotal: round2(subtotal),
//         vatPercent: RATE_CARD.vatPercent,
//         vat: round2(vat),
//         total: round2(total),
//     };
// }