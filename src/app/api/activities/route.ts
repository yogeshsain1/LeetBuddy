import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { userActivities, friendships } from "@/db/schema";
import { user } from "@/db/schema/auth";
import { auth } from "@/lib/auth";
import { eq, desc, and, or } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get("filter") || "all";

    let query;

    if (filter === "friends") {
      // Get friends' activities only
      const friendIds = await db
        .select({
          friendId: friendships.addresseeId,
        })
        .from(friendships)
        .where(
          and(
            eq(friendships.requesterId, session.user.id),
            eq(friendships.status, "accepted")
          )
        );

      const friendIds2 = await db
        .select({
          friendId: friendships.requesterId,
        })
        .from(friendships)
        .where(
          and(
            eq(friendships.addresseeId, session.user.id),
            eq(friendships.status, "accepted")
          )
        );

      const allFriendIds = [
        ...friendIds.map((f) => f.friendId),
        ...friendIds2.map((f) => f.friendId),
      ];

      if (allFriendIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }

      query = db
        .select({
          id: userActivities.id,
          username: user.username,
          fullName: user.name,
          avatarUrl: user.image,
          activityType: userActivities.activityType,
          title: userActivities.title,
          description: userActivities.description,
          createdAt: userActivities.createdAt,
        })
        .from(userActivities)
        .innerJoin(user, eq(userActivities.userId, user.id))
        .where(or(...allFriendIds.map((id) => eq(userActivities.userId, id))))
        .orderBy(desc(userActivities.createdAt))
        .limit(50);
    } else {
      // All activities
      query = db
        .select({
          id: userActivities.id,
          username: user.username,
          fullName: user.name,
          avatarUrl: user.image,
          activityType: userActivities.activityType,
          title: userActivities.title,
          description: userActivities.description,
          createdAt: userActivities.createdAt,
        })
        .from(userActivities)
        .innerJoin(user, eq(userActivities.userId, user.id))
        .orderBy(desc(userActivities.createdAt))
        .limit(50);
    }

    const activities = await query;

    return NextResponse.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    console.error("Activities API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch activities" },
      { status: 500 }
    );
  }
}
