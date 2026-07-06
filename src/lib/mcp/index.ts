import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getProfile from "./tools/get-profile";
import getSummary from "./tools/get-summary";
import listIncome from "./tools/list-income";
import logIncome from "./tools/log-income";
import logExpense from "./tools/log-expense";
import listLoans from "./tools/list-loans";

const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "rozanapay-mcp",
  title: "RozanaPay",
  version: "0.1.0",
  instructions:
    "Financial tools for RozanaPay users (gig workers in India). Read the signed-in user's income, expenses, savings, loans and credit score, and log new income or expense entries. All amounts are in Indian rupees.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getProfile, getSummary, listIncome, logIncome, logExpense, listLoans],
});