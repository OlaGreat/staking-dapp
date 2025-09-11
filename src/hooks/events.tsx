
import { parseAbiItem } from 'viem'
import { publicClient } from '../config/publicClient'
import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'

const STAKING_CONTRACT_ADDRESS = import.meta.env
  .VITE_STAKING_CONTRACT as `0x${string}`

export function useStakingEvents() {
  const { address } = useAccount()
  const [lastStake, setLastStake] = useState<any | null>(null)
  const [lastWithdraw, setLastWithdraw] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!address) return
    let unwatchStake: any, unwatchWithdraw: any

    try {
      // Watch Staked
      unwatchStake = publicClient.watchContractEvent({
        address: STAKING_CONTRACT_ADDRESS,
        abi: [parseAbiItem('event Staked(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)')],
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          if (filtered.length) setLastStake(filtered[filtered.length - 1])
        },
      })

      // Watch Withdrawn
      unwatchWithdraw = publicClient.watchContractEvent({
        address: STAKING_CONTRACT_ADDRESS,
        abi: [parseAbiItem('event Withdrawn(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)')],
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          if (filtered.length) setLastWithdraw(filtered[filtered.length - 1])
        },
      })

      return () => {
        unwatchStake?.()
        unwatchWithdraw?.()
      }
    } catch (err: any) {
      setError(err.message || 'Failed to watch events')
    }
  }, [address])

  return { lastStake, lastWithdraw, error }
}
