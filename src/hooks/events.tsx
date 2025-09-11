
import { parseAbiItem } from 'viem'
import { useEffect, useState } from 'react'
import { useAccount, usePublicClient } from 'wagmi'

const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT

export function useStakingEvents() {
  const { address } = useAccount()
  const [lastStake, setLastStake] = useState<any | null>(null)
  const [lastWithdraw, setLastWithdraw] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const publicClient = usePublicClient()

  useEffect(() => {
    if (!address) return
    let unwatchStake: any, unwatchWithdraw: any

    try {
      unwatchStake = publicClient.watchEvent({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event Staked(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)'
        ),
        onLogs: (logs) => {
            console.log("evnt ==========", logs)
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          if (filtered.length) setLastStake(filtered[filtered.length - 1])
        },

      })

      unwatchWithdraw = publicClient.watchEvent({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event Withdrawn(address indexed user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)'
        ),
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          console.log("log event=============", filtered)
          if (filtered.length) setLastWithdraw(filtered[filtered.length - 1])
        },
      })
    } catch (err: any) {
      setError(err.message || 'Failed to watch events')
    }

    return () => {
      unwatchStake?.()
      unwatchWithdraw?.()
    }
  }, [address])

    console.log("log stake event=============", lastStake)   
    console.log("log withdraw event=============", lastWithdraw)




  return { lastStake, lastWithdraw, error }
}

