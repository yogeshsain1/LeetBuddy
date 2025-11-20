import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { leetcodeStats, friendships } from "@/db/schema";
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
    const scope = searchParams.get("scope") || "global";

    let query;

    if (scope === "friends") {
      // Get friends only
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
        session.user.id,
      ];

      query = db
        .select({
          id: user.id,
          username: user.name,
          fullName: user.name,
          avatarUrl: user.image,
          totalSolved: leetcodeStats.totalSolved,
          easyCount: leetcodeStats.easyCount,
          mediumCount: leetcodeStats.mediumCount,
          hardCount: leetcodeStats.hardCount,
          contestRating: leetcodeStats.contestRating,
          currentStreak: leetcodeStats.currentStreak,
        })
        .from(user)
        .leftJoin(leetcodeStats, eq(user.id, leetcodeStats.userId))
        .where(
          or(...allFriendIds.map((id) => eq(user.id, id)))
        )
        .orderBy(desc(leetcodeStats.totalSolved))
        .limit(100);
    } else {
      // Global leaderboard
      query = db
        .select({
          id: user.id,
          username: user.username,
          fullName: user.name,
          avatarUrl: user.image,
          totalSolved: leetcodeStats.totalSolved,
          easyCount: leetcodeStats.easyCount,
          mediumCount: leetcodeStats.mediumCount,
          hardCount: leetcodeStats.hardCount,
          contestRating: leetcodeStats.contestRating,
          currentStreak: leetcodeStats.currentStreak,
        })
        .from(user)
        .leftJoin(leetcodeStats, eq(user.id, leetcodeStats.userId))
        .orderBy(desc(leetcodeStats.totalSolved))
        .limit(100);
    }

    const results = await query;

    // Fill in default values for users without stats
    const leaderboard = results.map((user) => ({
      ...user,
      totalSolved: user.totalSolved || 0,
      easyCount: user.easyCount || 0,
      mediumCount: user.mediumCount || 0,
      hardCount: user.hardCount || 0,
      contestRating: user.contestRating || 0,
      currentStreak: user.currentStreak || 0,
    }));

    return NextResponse.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
