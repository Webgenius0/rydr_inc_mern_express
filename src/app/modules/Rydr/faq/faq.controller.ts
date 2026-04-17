import { Request, Response } from "express";
import { FaqService } from "./faq.service";
import { catchAsync } from "../../../utils/catchAsync";
import sendResponse from "../../../utils/sendResponse";

const createFaq = catchAsync(async (req: Request, res: Response) => {
    const result = await FaqService.createFaq(req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQ created",
        data: result,
    });
});

const getFaqsByPage = catchAsync(async (req: Request, res: Response) => {
    const { pageKey } = req.params;
    const includeInactive = req.query.includeInactive === "true";

    const result = await FaqService.getFaqsByPage(pageKey, includeInactive);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQs retrieved",
        data: result,
    });
});

const updateFaq = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await FaqService.updateFaq(id, req.body);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQ updated",
        data: result,
    });
});

const deleteFaq = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await FaqService.deleteFaq(id);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQ removed",
        data: result,
    });
});

const reorderFaqs = catchAsync(async (req: Request, res: Response) => {
    const { pageKey, items } = req.body;
    const result = await FaqService.reorderFaqs(pageKey, items);

    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "FAQ reordered",
        data: result,
    });
});

export const FaqController = {
    getFaqsByPage,
    createFaq,
    updateFaq,
    deleteFaq,
    reorderFaqs,
};