import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "@/hooks/useTranslations";
import { Button } from "../ui/button";

import { useAppDispatch } from "@/lib/redux/store";
import { setReview } from "@/lib/redux/slices/userSlice";
import { Loader2 } from "lucide-react";

const reviewFormSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;

export interface AddReviewProps {
  isLoggedIn: boolean;
  handleSubmit: (data: ReviewFormValues) => void;
  data: ReviewFormValues | null;
  isLoading: boolean;
}

function AddReview({
  isLoggedIn,
  data,
  handleSubmit,
  isLoading,
}: AddReviewProps) {
  const { t } = useTranslations();
  const dispatch = useAppDispatch();
  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: data?.rating || 0,
      comment: data?.comment || "",
    },
  });

  // Reset form when data changes (e.g., after successful submission)
  useEffect(() => {
    form.reset({
      rating: data?.rating || 0,
      comment: data?.comment || "",
    });
  }, [data, form]);

  return (
    <div className="mt-4 max-w-lg mx-auto">
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="mb-4">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => form.setValue("rating", i + 1)}
                onChange={(e) => {
                  form.setValue("rating", i + 1);
                  dispatch(
                    setReview({
                      comment: form.getValues("comment"),
                      rating: i + 1,
                      company_id: "",
                    })
                  );
                }}
                className={`text-gray-300 ${
                  form.watch("rating") >= i + 1 ? "text-yellow-400" : ""
                }`}
              >
                <svg
                  key={i}
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.363 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.363-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700"
          >
            Commentaire
          </label>
          <div className="mt-1">
            <textarea
              id="comment"
              {...form.register("comment")}
              onChange={(e) => {
                form.setValue("comment", e.target.value);
                dispatch(
                  setReview({
                    comment: e.target.value,
                    rating: form.getValues("rating"),
                    company_id: "",
                  })
                );
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />{" "}
                {t("client.reviews.addReview")}
              </>
            ) : isLoggedIn ? (
              t("client.reviews.addReview")
            ) : (
              t("common.loginToAddReview")
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
export default AddReview;
