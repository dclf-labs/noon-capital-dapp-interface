import { useMemo } from 'react'

import { protocolConfigs } from '@/config'
import usePoints from '@/features/api/hooks/usePoints'
import type { ChainPoints } from '@/features/api/lib/points'
import type { Connection } from '@/lib/connection'
import { bnToInt, toNum, toStr } from '@/lib/format'

const useTotalPointsForSeason = (season: string | number, connection: Connection) => {
  const points = usePoints(connection)

  const [totalPoints, chainPoints, referralPoints] = useMemo(() => {
    const allChains = Object.values(protocolConfigs).filter(Boolean)

    if (!points || !points?.data) {
      return [
        0,
        allChains.map((c) => ({
          id: toNum(c?.id),
          pointsApiChainId: toNum(c?.pointsApiChainId),
          name: c?.name,
          iconSlug: c?.iconSlug,
          points: 0,
        })),
        0,
      ]
    }

    let superTotal = 0
    const chainPoints: ChainPoints[] = []

    for (const chain of allChains) {
      let total: number = 0
      for (const point of Object.values(
        points?.data?.byChain?.[toNum(chain?.pointsApiChainId)]?.byProtocol || {},
      )) {
        total += bnToInt(point?.bySeasons?.[toStr(season)]?.total || 0, 18)
      }

      chainPoints.push({
        id: toNum(chain?.id),
        pointsApiChainId: toNum(chain?.pointsApiChainId),
        name: chain?.name || '',
        iconSlug: chain?.iconSlug || '',
        points: total,
      })
      superTotal += total
    }

    const referralPoints =
      bnToInt(
        points?.data?.byChain?.['0']?.byProtocol?.REFEREE_BOOST?.bySeasons?.[toStr(season)]
          ?.total || 0,
        18,
      ) +
      bnToInt(
        points?.data?.byChain?.['0']?.byProtocol?.REFERRAL?.bySeasons?.[toStr(season)]?.total || 0,
        18,
      )

    return [superTotal + referralPoints, chainPoints, referralPoints]
  }, [points, season])

  return useMemo(() => {
    return {
      isLoading: points?.isLoading,
      isError: points?.isError,
      totalPoints: toNum(totalPoints),
      isFetching: points?.isFetching,
      chainPoints:
        chainPoints.map((c) => ({
          ...c,
          points: toNum(c?.points),
        })) ?? [],
      referralPoints: toNum(referralPoints),
    }
  }, [
    points?.isLoading,
    points?.isError,
    points?.isFetching,
    totalPoints,
    chainPoints,
    referralPoints,
  ])
}

export default useTotalPointsForSeason
