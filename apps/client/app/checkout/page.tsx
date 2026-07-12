import { redirect } from "next/navigation";
import { findPlan } from "@zenvy/shared/orders";

type CheckoutSearchParams = {
  plan?: string;
};

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<CheckoutSearchParams> }) {
  const params = await searchParams;
  const plan = findPlan(params.plan);
  redirect(`/plans/${plan.id}`);
}
