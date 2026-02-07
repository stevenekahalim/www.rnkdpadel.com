'use server'

import { createAdminClient } from '@/lib/supabase-admin'
import { revalidatePath } from 'next/cache'

interface PlayerAssignment {
  matchNumber: number
  homePlayer1Id: string
  homePlayer2Id: string
  awayPlayer1Id: string
  awayPlayer2Id: string
}

interface MatchScore {
  matchNumber: number
  set1Home: number
  set1Away: number
  set2Home: number
  set2Away: number
  set3Home?: number
  set3Away?: number
  homeSetsWon: number
  awaySetsWon: number
}

export async function createFixture(formData: FormData): Promise<{ success: boolean; error?: string; fixtureId?: string }> {
  try {
    const seasonId = formData.get('seasonId') as string
    const homeClubId = formData.get('homeClubId') as string
    const awayClubId = formData.get('awayClubId') as string
    const gameweek = parseInt(formData.get('gameweek') as string)
    const scheduledDate = formData.get('scheduledDate') as string
    const scheduledTime = formData.get('scheduledTime') as string
    const venueName = formData.get('venueName') as string

    if (!seasonId || !homeClubId || !awayClubId || !gameweek || !scheduledDate || !scheduledTime || !venueName) {
      return { success: false, error: 'Missing required fields' }
    }

    if (homeClubId === awayClubId) {
      return { success: false, error: 'Home and away clubs must be different' }
    }

    const supabase = createAdminClient()

    // Create fixture
    const { data: fixture, error: fixtureError } = await supabase
      .from('liga_fixtures')
      .insert({
        season_id: seasonId,
        home_club_id: homeClubId,
        away_club_id: awayClubId,
        gameweek,
        scheduled_date: scheduledDate,
        scheduled_time: scheduledTime,
        venue_name: venueName,
        status: 'scheduled',
      })
      .select('id')
      .single()

    if (fixtureError) {
      return { success: false, error: fixtureError.message }
    }

    const fixtureId = fixture.id

    // Create 4 empty matches
    const matches = Array.from({ length: 4 }, (_, i) => ({
      fixture_id: fixtureId,
      match_number: i + 1,
      status: 'pending',
    }))

    const { error: matchError } = await supabase
      .from('liga_matches')
      .insert(matches)

    if (matchError) {
      // Clean up fixture if match creation fails
      await supabase.from('liga_fixtures').delete().eq('id', fixtureId)
      return { success: false, error: matchError.message }
    }

    revalidatePath('/admin/liga/fixtures')
    return { success: true, fixtureId }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function assignPlayers(
  fixtureId: string,
  assignments: PlayerAssignment[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!fixtureId || !assignments.length) {
      return { success: false, error: 'Missing required fields' }
    }

    const supabase = createAdminClient()

    // Validate all assignments have required fields
    for (const assignment of assignments) {
      if (!assignment.homePlayer1Id || !assignment.homePlayer2Id || !assignment.awayPlayer1Id || !assignment.awayPlayer2Id) {
        return { success: false, error: 'All players must be assigned for each match' }
      }
    }

    // Update matches with player assignments
    for (const assignment of assignments) {
      const { error } = await supabase
        .from('liga_matches')
        .update({
          home_player1_id: assignment.homePlayer1Id,
          home_player2_id: assignment.homePlayer2Id,
          away_player1_id: assignment.awayPlayer1Id,
          away_player2_id: assignment.awayPlayer2Id,
          status: 'assigned',
        })
        .eq('fixture_id', fixtureId)
        .eq('match_number', assignment.matchNumber)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath(`/admin/liga/fixtures/${fixtureId}`)
    revalidatePath('/admin/liga/fixtures')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function enterScores(
  fixtureId: string,
  scores: MatchScore[]
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!fixtureId || !scores.length) {
      return { success: false, error: 'Missing required fields' }
    }

    const supabase = createAdminClient()

    // Update matches with scores
    for (const score of scores) {
      const { error } = await supabase
        .from('liga_matches')
        .update({
          set1_home_games: score.set1Home,
          set1_away_games: score.set1Away,
          set2_home_games: score.set2Home,
          set2_away_games: score.set2Away,
          ...(score.set3Home !== undefined && { set3_home_games: score.set3Home }),
          ...(score.set3Away !== undefined && { set3_away_games: score.set3Away }),
          home_sets_won: score.homeSetsWon,
          away_sets_won: score.awaySetsWon,
          status: 'completed',
        })
        .eq('fixture_id', fixtureId)
        .eq('match_number', score.matchNumber)

      if (error) {
        return { success: false, error: error.message }
      }
    }

    revalidatePath(`/admin/liga/fixtures/${fixtureId}`)
    revalidatePath('/admin/liga/fixtures')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}

export async function deleteFixture(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    if (!id) {
      return { success: false, error: 'Fixture ID required' }
    }

    const supabase = createAdminClient()

    // Delete matches first (cascades), then fixture
    const { error: matchError } = await supabase
      .from('liga_matches')
      .delete()
      .eq('fixture_id', id)

    if (matchError) {
      return { success: false, error: matchError.message }
    }

    const { error: fixtureError } = await supabase
      .from('liga_fixtures')
      .delete()
      .eq('id', id)

    if (fixtureError) {
      return { success: false, error: fixtureError.message }
    }

    revalidatePath('/admin/liga/fixtures')
    return { success: true }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: message }
  }
}
