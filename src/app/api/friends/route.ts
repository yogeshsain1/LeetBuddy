import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

      return NextResponse.json({ friends: friendDetails });
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

      return NextResponse.json({ pending: pendingDetails });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("GET /api/friends error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, userId, friendshipId } = body;

    if (action === "send") {
      // Send friend request
      await sendFriendRequest(parseInt(session.user.id), userId);
      return NextResponse.json({ success: true, message: "Friend request sent" });
    } else if (action === "accept") {
      // Accept friend request
      await acceptFriendRequest(friendshipId, parseInt(session.user.id));
      return NextResponse.json({ success: true, message: "Friend request accepted" });
    } else if (action === "reject") {
      // Reject friend request
      await rejectFriendRequest(friendshipId, parseInt(session.user.id));
      return NextResponse.json({ success: true, message: "Friend request rejected" });
    } else if (action === "remove") {
      // Remove friend
      await removeFriend(parseInt(session.user.id), userId);
      return NextResponse.json({ success: true, message: "Friend removed" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("POST /api/friends error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
