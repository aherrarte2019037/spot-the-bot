import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import type { TablesInsert, TablesUpdate } from "../_shared/database.types.ts";
import { createErrorResponse, createSuccessResponse, createSupabaseClient, requireAuth } from "../_shared/utils.ts";

interface SubmitVotesRequest {
  game_id: number;
  voter_id: number;
  target_ids: number[];
}

serve(async (req) => {
  try {
    const authError = requireAuth(req);
    if (authError) return authError;

    const supabase = createSupabaseClient();

    const { game_id, voter_id, target_ids }: SubmitVotesRequest = await req.json();

    if (!game_id || !voter_id || !target_ids || !Array.isArray(target_ids) || target_ids.length === 0) {
      return createErrorResponse("Missing required fields: game_id, voter_id, target_ids", 400);
    }

    const { data: game, error: gameError } = await supabase
      .from("games")
      .select("*, players:game_players(*)")
      .eq("id", game_id)
      .single();

    if (gameError || !game) {
      return createErrorResponse("Game not found", 404);
    }

    if (game.status !== "voting") {
      return createErrorResponse("Game is not in voting phase", 400);
    }

    const players = game.players;

    const voter = players.find((p) => p.id === voter_id);
    if (!voter) {
      return createErrorResponse("Voter is not a player in this game", 403);
    }

    if (voter.is_bot) {
      return createErrorResponse("Bots cannot vote", 403);
    }

    const allPlayerIds = players.map((p) => p.id);
    const invalidTargets = target_ids.filter((id) => !allPlayerIds.includes(id));
    if (invalidTargets.length > 0) {
      return createErrorResponse("Invalid target player IDs", 400);
    }

    if (target_ids.includes(voter_id)) {
      return createErrorResponse("Cannot vote for yourself", 400);
    }

    // 5. Check if voter has already voted
    const { data: existingVotes } = await supabase
      .from("votes")
      .select("id")
      .eq("game_id", game_id)
      .eq("voter_id", voter_id)
      .limit(1);

    if (existingVotes && existingVotes.length > 0) {
      return createErrorResponse("You have already voted", 400);
    }

    // 6. Insert all votes
    const votesToInsert: TablesInsert<"votes">[] = target_ids.map((target_id) => ({
      game_id,
      voter_id,
      target_id,
    }));

    const { data: votes, error: votesError } = await supabase
      .from("votes")
      .insert(votesToInsert)
      .select();

    if (votesError) {
      return createErrorResponse(`Failed to submit votes: ${votesError.message}`, 500);
    }

    // 7. Check if all human players have voted
    const humanPlayers = players.filter((p) => !p.is_bot);
    const { data: allVotes } = await supabase
      .from("votes")
      .select("voter_id")
      .eq("game_id", game_id);

    const uniqueVoters = new Set(allVotes?.map((v) => v.voter_id) || []);
    const allVoted = humanPlayers.every((p) => uniqueVoters.has(p.id));

    // 8. If all voted, calculate results and update game status
    if (allVoted) {
      try {
        // Get all votes for the game
        const { data: allGameVotes } = await supabase
          .from("votes")
          .select("*")
          .eq("game_id", game_id);

        if (allGameVotes) {
          // Identify bot players
          const botPlayers = players.filter((p) => p.is_bot);
          const botPlayerIds = new Set(botPlayers.map((p) => p.id));

          // Calculate scores for each human player
          const scores: Array<{
            player_id: number;
            correct_votes: number;
            total_votes: number;
            score: number;
          }> = [];

          for (const player of humanPlayers) {
            // Get votes cast by this player
            const playerVotes = allGameVotes.filter((v) => v.voter_id === player.id);

            // Count correct votes (votes for actual bots)
            const correctVotes = playerVotes.filter((v) => v.target_id !== null && botPlayerIds.has(v.target_id)).length;

            // Calculate score (100 points per correct vote)
            const score = correctVotes * 100;

            scores.push({
              player_id: player.id,
              correct_votes: correctVotes,
              total_votes: playerVotes.length,
              score,
            });
          }

          // Update player scores in game_players
          for (const scoreData of scores) {
            const scoreUpdate: TablesUpdate<"game_players"> = { score: scoreData.score };
            await supabase
              .from("game_players")
              .update(scoreUpdate)
              .eq("id", scoreData.player_id);
          }

          // Update profiles with XP, games_played, and games_won
          for (const scoreData of scores) {
            const player = humanPlayers.find((p) => p.id === scoreData.player_id);
            if (player?.profile_id) {
              // Get current profile stats
              const { data: profile } = await supabase
                .from("profiles")
                .select("xp, games_played, games_won")
                .eq("id", player.profile_id)
                .single();

              if (profile) {
                // Award XP (e.g., score / 10, minimum 10 XP per game)
                const xpGained = Math.max(10, Math.floor(scoreData.score / 10));
                const newXp = profile.xp + xpGained;

                // Increment games_played
                const newGamesPlayed = profile.games_played + 1;

                // Increment games_won if player correctly identified at least one bot
                const newGamesWon = profile.games_won + (scoreData.correct_votes > 0 ? 1 : 0);

                // Update profile stats
                const profileUpdate: TablesUpdate<"profiles"> = {
                  xp: newXp,
                  games_played: newGamesPlayed,
                  games_won: newGamesWon,
                };
                await supabase
                  .from("profiles")
                  .update(profileUpdate)
                  .eq("id", player.profile_id);
              }
            }
          }

          // Update game status to completed
          const gameUpdate: TablesUpdate<"games"> = { status: "completed" };
          await supabase
            .from("games")
            .update(gameUpdate)
            .eq("id", game_id);
        }
      } catch (_error) {
        return createErrorResponse("Failed to calculate results", 500);
      }
    }

    return createSuccessResponse({ votes }, "Votes submitted successfully");
  } catch {
    return createErrorResponse("Failed to submit votes", 500);
  }
});

