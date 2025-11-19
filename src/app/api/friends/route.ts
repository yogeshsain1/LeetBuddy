import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  successResponse,
  errorResponse,
  unauthorizedError,
  validationError,
  APIError,
} from "@/lib/api-response";
import { validateRequestBody, friendRequestSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getUserFriends,
  getPendingFriendRequests,
  removeFriend,
} from "@/lib/friends";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    checkRateLimit(request, "api");

    // Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return unauthorizedError();
    }

    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get("action");

    if (action === "friends") {
      // Get all friends
      const friends = await getUserFriends(parseInt(session.user.id));
      
      // Fetch friend details
      const friendDetails = await Promise.all(
        friends.map(async (f) => {
          const [user] = await db
            .select({
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              avatarUrl: users.avatarUrl,
              bio: users.bio,
            })
            .from(users)
            .where(eq(users.id, f.friendId));
          return { ...user, friendsSince: f.since };
        })
      );

      return successResponse({ friends: friendDetails });
    } else if (action === "pending") {
      // Get pending friend requests
      const pending = await getPendingFriendRequests(parseInt(session.user.id));
      
      // Fetch requester details
      const pendingDetails = await Promise.all(
        pending.map(async (p) => {
          const [user] = await db
            .select({
              id: users.id,
              username: users.username,
              fullName: users.fullName,
              avatarUrl: users.avatarUrl,
              bio: users.bio,
            })
            .from(users)
            .where(eq(users.id, p.requesterId));
          return { ...p, requester: user };
        })
      );

      return successResponse({ pending: pendingDetails });
    }

    return validationError("Invalid action parameter");
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - stricter for writes
    checkRateLimit(request, "strict");

    // Authentication
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return unauthorizedError();
    }

    const body = await request.json();
    const { action, userId, friendshipId } = body;

    if (action === "send") {
      // Validate request
      const data = validateRequestBody(body, friendRequestSchema);
      
      // Send friend request
      await sendFriendRequest(parseInt(session.user.id), data.userId);
      return successResponse(
        { success: true },
        { timestamp: new Date().toISOString() }
      );
    } else if (action === "accept") {
      if (!friendshipId) {
        return validationError("friendshipId is required");
      }
      await acceptFriendRequest(friendshipId, parseInt(session.user.id));
      return successResponse({ success: true });
    } else if (action === "reject") {
      if (!friendshipId) {
        return validationError("friendshipId is required");
      }
      await rejectFriendRequest(friendshipId, parseInt(session.user.id));
      return successResponse({ success: true });
    } else if (action === "remove") {
      if (!userId) {
        return validationError("userId is required");
      }
      await removeFriend(parseInt(session.user.id), userId);
      return successResponse({ success: true });
    }

    return validationError("Invalid action parameter");
  } catch (error) {
    if (error instanceof APIError) {
      return errorResponse(error);
    }
    return errorResponse(
      error instanceof Error ? error : new Error("Unknown error")
    );
  }
}
