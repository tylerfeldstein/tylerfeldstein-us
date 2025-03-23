/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as chatAuth from "../chatAuth.js";
import type * as chatTokens from "../chatTokens.js";
import type * as crons from "../crons.js";
import type * as inngestResults from "../inngestResults.js";
import type * as maintenance from "../maintenance.js";
import type * as messages from "../messages.js";
import type * as myFunctions from "../myFunctions.js";
import type * as notifications from "../notifications.js";
import type * as secureMessages from "../secureMessages.js";
import type * as types_jwt from "../types/jwt.js";
import type * as users from "../users.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  chatAuth: typeof chatAuth;
  chatTokens: typeof chatTokens;
  crons: typeof crons;
  inngestResults: typeof inngestResults;
  maintenance: typeof maintenance;
  messages: typeof messages;
  myFunctions: typeof myFunctions;
  notifications: typeof notifications;
  secureMessages: typeof secureMessages;
  "types/jwt": typeof types_jwt;
  users: typeof users;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
