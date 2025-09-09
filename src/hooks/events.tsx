import { parseAbiItem } from 'viem'
import { publicClient } from '../config/publicClient'
import { useEffect, useState } from 'react'

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT

export function useStakingEvents() {
  const [stakeEvents, setStakeEvents] = useState<any[]>([])
  const [withdrawEvents, setWithdrawEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchEvents() {
      setLoading(true)
      setError(null)
      try {
        const latestBlock = await publicClient.getBlockNumber()

        // Fetch Staked events
        const stakedLogs = await publicClient.getLogs({
          address: STAKING_CONTRACT_ADDRESS,
          event: parseAbiItem(
            'event Staked(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)'
          ),
          fromBlock: latestBlock - 10000n,
          toBlock: 'latest',
        })

        // Fetch Withdrawn events
        const withdrawnLogs = await publicClient.getLogs({
          address: STAKING_CONTRACT_ADDRESS,
          event: parseAbiItem(
            'event Withdrawn(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)'
          ),
          fromBlock: latestBlock - 10000n,
          toBlock: 'latest',
        })

        setStakeEvents(stakedLogs)
        setWithdrawEvents(withdrawnLogs)
      } catch (err: any) {
        setError(err.message || 'Failed to fetch events')
      } finally {
        setLoading(false)
      }
    }
    fetchEvents()
  }, [])

  return { stakeEvents, withdrawEvents, loading, error }
}