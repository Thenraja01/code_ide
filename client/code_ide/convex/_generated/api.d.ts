/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as aiStreams from "../aiStreams.js";
import type * as cleanup from "../cleanup.js";
import type * as diffs from "../diffs.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as jobStatus from "../jobStatus.js";
import type * as liveFiles from "../liveFiles.js";
import type * as projects from "../projects.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  aiStreams: typeof aiStreams;
  cleanup: typeof cleanup;
  diffs: typeof diffs;
  files: typeof files;
  http: typeof http;
  jobStatus: typeof jobStatus;
  liveFiles: typeof liveFiles;
  projects: typeof projects;
  users: typeof users;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
