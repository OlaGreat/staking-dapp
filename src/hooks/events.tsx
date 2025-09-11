
import { formatEther, parseAbiItem } from 'viem'
import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'
import { log } from 'console'

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT

export function useStakingEvents() {
  const { address } = useAccount()
  const [lastStake, setLastStake] = useState<any | null>(null)
  const [lastWithdraw, setLastWithdraw] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!address) return
    let unwatchStake: any, unwatchWithdraw: any, unwatchEmergercyWithdraw: any

    try {
      unwatchStake = publicClient.watchEvent({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event Staked(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)'
        ),
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          if (filtered.length) setLastStake(formatEther(filtered[filtered.length - 1].args.newTotalStaked))
        },

      })

      unwatchWithdraw = publicClient.watchEvent({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event Withdrawn(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)'
        ),
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          if (filtered.length) setLastStake(formatEther(filtered[filtered.length - 1].args.newTotalStaked))
        },
      })

      unwatchEmergercyWithdraw = publicClient.watchEvent({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event EmergencyWithdrawn(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked)'
        ),
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          if (filtered.length) setLastStake(formatEther(filtered[filtered.length - 1].args.newTotalStaked))
        },
      })
    } catch (err: any) {
      setError(err.message || 'Failed to watch events')
    }

    return () => {
      unwatchStake?.()
      unwatchWithdraw?.()
      unwatchEmergercyWithdraw?.()
    }
  }, [address])


  return { lastStake, lastWithdraw, error }
}

