export type TFaq = {
  pageKey: "about" | "finance" | string;
  question: string;
  answer: string;
  isActive: boolean;
};