import { useMemo } from 'react'

import useTotalPointsForSeason from '@/features/api/hooks/useTotalPointsForSeason'
import type { Connection } from '@/lib/connection'
import { toNum } from '@/lib/format'

const useTotalPointsForPastSeasons = (connection: Connection) => {
  const season1TotalPoints = useTotalPointsForSeason(1, connection)
  const season2TotalPoints = useTotalPointsForSeason(2, connection)
  const season3TotalPoints = useTotalPointsForSeason(3, connection)
  const season4TotalPoints = useTotalPointsForSeason(4, connection)
  const season5TotalPoints = useTotalPointsForSeason(5, connection)
  const season6TotalPoints = useTotalPointsForSeason(6, connection)
  const season7TotalPoints = useTotalPointsForSeason(7, connection)
  const season8TotalPoints = useTotalPointsForSeason(8, connection)

  return useMemo(() => {
    return {
      isLoading:
        season1TotalPoints?.isLoading ||
        season2TotalPoints?.isLoading ||
        season3TotalPoints?.isLoading ||
        season4TotalPoints?.isLoading ||
        season5TotalPoints?.isLoading ||
        season6TotalPoints?.isLoading ||
        season7TotalPoints?.isLoading,
      isError:
        season1TotalPoints?.isError ||
        season2TotalPoints?.isError ||
        season3TotalPoints?.isError ||
        season4TotalPoints?.isError ||
        season5TotalPoints?.isError ||
        season6TotalPoints?.isError ||
        season7TotalPoints?.isError,
      points: [
        { seasonName: 'Public Beta', points: season1TotalPoints?.totalPoints },
        { seasonName: 'Season 1: High Noon', points: season2TotalPoints?.totalPoints },
        { seasonName: 'Season 2: The Spark', points: season3TotalPoints?.totalPoints },
        { seasonName: 'Season 3: The Echo', points: season4TotalPoints?.totalPoints },
        { seasonName: 'Season 4: The Compass', points: season5TotalPoints?.totalPoints },
        { seasonName: 'Season 5: The Flare', points: season6TotalPoints?.totalPoints },
        { seasonName: 'Season 6: The Shine', points: season7TotalPoints?.totalPoints },
        { seasonName: 'Season 7: The Zenith', points: season8TotalPoints?.totalPoints },
      ],
      isFetching:
        season1TotalPoints?.isFetching ||
        season2TotalPoints?.isFetching ||
        season3TotalPoints?.isFetching ||
        season4TotalPoints?.isFetching ||
        season5TotalPoints?.isFetching ||
        season6TotalPoints?.isFetching ||
        season7TotalPoints?.isFetching ||
        season8TotalPoints?.isFetching,
      totalPoints:
        toNum(season1TotalPoints?.totalPoints) +
        toNum(season2TotalPoints?.totalPoints) +
        toNum(season3TotalPoints?.totalPoints) +
        toNum(season4TotalPoints?.totalPoints) +
        toNum(season5TotalPoints?.totalPoints) +
        toNum(season6TotalPoints?.totalPoints) +
        toNum(season7TotalPoints?.totalPoints) +
        toNum(season8TotalPoints?.totalPoints),
    }
  }, [
    season1TotalPoints?.isError,
    season1TotalPoints?.isFetching,
    season1TotalPoints?.isLoading,
    season1TotalPoints?.totalPoints,
    season2TotalPoints?.isError,
    season2TotalPoints?.isFetching,
    season2TotalPoints?.isLoading,
    season2TotalPoints?.totalPoints,
    season3TotalPoints?.isError,
    season3TotalPoints?.isFetching,
    season3TotalPoints?.isLoading,
    season3TotalPoints?.totalPoints,
    season4TotalPoints?.isError,
    season4TotalPoints?.isFetching,
    season4TotalPoints?.isLoading,
    season4TotalPoints?.totalPoints,
    season5TotalPoints?.isError,
    season5TotalPoints?.isFetching,
    season5TotalPoints?.isLoading,
    season5TotalPoints?.totalPoints,
    season6TotalPoints?.isError,
    season6TotalPoints?.isFetching,
    season6TotalPoints?.isLoading,
    season6TotalPoints?.totalPoints,
    season7TotalPoints?.isError,
    season7TotalPoints?.isFetching,
    season7TotalPoints?.isLoading,
    season7TotalPoints?.totalPoints,
    season8TotalPoints?.isFetching,
    season8TotalPoints?.totalPoints,
  ])
}

export default useTotalPointsForPastSeasons
