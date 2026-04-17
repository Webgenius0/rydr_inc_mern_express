/* eslint-disable @typescript-eslint/no-explicit-any */
import { Faq } from "./faq.model";
import { TFaq } from "./faq.interface";

const createFaq = async (payload: TFaq) => {
    return await Faq.create(payload);
};

const getFaqsByPage = async (pageKey: string, includeInactive = false) => {
    const filter: any = { pageKey };
    if (!includeInactive) filter.isActive = true;

    return await Faq.find(filter).sort({ order: 1, createdAt: 1 });
};

const updateFaq = async (id: string, payload: Partial<TFaq>) => {
    return await Faq.findByIdAndUpdate(id, payload, { new: true });
};

const deleteFaq = async (id: string) => {
    // production safe: soft delete better
    return await Faq.findByIdAndDelete(id);
};

const reorderFaqs = async (pageKey: string, items: { id: string; order: number }[]) => {
    // bulk update (fast)
    const ops = items.map((it) => ({
        updateOne: {
            filter: { _id: it.id, pageKey },
            update: { $set: { order: it.order } },
        },
    }));

    await Faq.bulkWrite(ops);
    return await Faq.find({ pageKey, isActive: true }).sort({ order: 1 });
};

export const FaqService = {
    getFaqsByPage,
    createFaq,
    updateFaq,
    deleteFaq,
    reorderFaqs,
};