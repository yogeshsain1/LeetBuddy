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
import { user } from "@/db/schema/auth";
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
      const friends = await getUserFriends(session.user.id);
      
      // Fetch friend details
      const friendDetails = await Promise.all(
        friends.map(async (f) => {
          const [userDetail] = await db
            .select({
              id: user.id,
              username: user.username,
              fullName: user.name,
              avatarUrl: user.image,
              bio: user.bio,
            })
            .from(user)
            .where(eq(user.id, f.friendId));
          return { ...userDetail, friendsSince: f.since };
        })
      );

      return successResponse({ friends: friendDetails });
    } else if (action === "pending") {
      // Get pending friend requests
      const pending = await getPendingFriendRequests(session.user.id);
      
      // Fetch requester details
      const pendingDetails = await Promise.all(
        pending.map(async (p) => {
          const [userDetail] = await db
            .select({
              id: user.id,
              username: user.username,
              fullName: user.name,
              avatarUrl: user.image,
              bio: user.bio,
            })
            .from(user)
            .where(eq(user.id, p.requesterId));
          return { ...p, requester: userDetail };
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
      await sendFriendRequest(session.user.id, data.userId);
      return successResponse(
        { success: true },
        { timestamp: new Date().toISOString() }
      );
    } else if (action === "accept") {
      if (!friendshipId) {
        return validationError("friendshipId is required");
      }
      await acceptFriendRequest(friendshipId, session.user.id);
      return successResponse({ success: true });
    } else if (action === "reject") {
      if (!friendshipId) {
        return validationError("friendshipId is required");
      }
      await rejectFriendRequest(friendshipId, session.user.id);
      return successResponse({ success: true });
    } else if (action === "remove") {
      if (!userId) {
        return validationError("userId is required");
      }
      await removeFriend(session.user.id, userId);
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
