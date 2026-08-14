import { z } from "zod";
import { router, publicProcedure } from "../trpc.js";
import { githubAdapter } from "../../github/adapter.js";

export const githubRouter = router({
  issues: publicProcedure.input(z.object({ repo: z.string() })).query(async ({ input }) => {
    return githubAdapter.listIssues(input.repo);
  }),
  branches: publicProcedure.input(z.object({ repo: z.string() })).query(async ({ input }) => {
    return githubAdapter.listBranches(input.repo);
  }),
  pullRequests: publicProcedure.input(z.object({ repo: z.string() })).query(async ({ input }) => {
    return githubAdapter.listPullRequests(input.repo);
  }),
  workflowRuns: publicProcedure.input(z.object({ repo: z.string() })).query(async ({ input }) => {
    return githubAdapter.listWorkflowRuns(input.repo);
  }),
  recentCommits: publicProcedure.input(z.object({ repo: z.string() })).query(async ({ input }) => {
    return githubAdapter.listRecentCommits(input.repo);
  }),
});
