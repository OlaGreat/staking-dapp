// // import { parseAbiItem } from 'viem'
// // import { publicClient } from '../config/publicClient'
// // import { useEffect, useState } from 'react'
// // import { useAccount } from 'wagmi'

// // const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT

// // export function useStakingEvents() {
// //   const [stakeEvents, setStakeEvents] = useState<any[]>([])
// //   const [withdrawEvents, setWithdrawEvents] = useState<any[]>([])
// //   const [loading, setLoading] = useState(false)
// //   const [error, setError] = useState<string | null>(null)
// //   const { address } = useAccount() 
// //   useEffect(() => {
// //     if (!address) return

// //     setLoading(true)
// //     setError(null)

// //     const unwatchStake = publicClient.watchEvent({
// //       address: STAKING_CONTRACT_ADDRESS,
// //       event: parseAbiItem(
// //         'event Staked(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)'
// //       ),
// //       onLogs: logs => {
// //         const userLogs = logs.filter(log => log.args.user?.toLowerCase() === address.toLowerCase())
// //         if (userLogs.length > 0) {
// //           setStakeEvents(prev => [...prev, ...userLogs])
// //         }
// //       }
// //     })

// //     const unwatchWithdraw = publicClient.watchEvent({
// //       address: STAKING_CONTRACT_ADDRESS,
// //       event: parseAbiItem(
// //         'event Withdrawn(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)'
// //       ),
// //       onLogs: logs => {
// //         const userLogs = logs.filter(log => log.args.user?.toLowerCase() === address.toLowerCase())
// //         if (userLogs.length > 0) {
// //           setWithdrawEvents(prev => [...prev, ...userLogs])
// //         }
// //       }
// //     })

// //     setLoading(false)

// //     return () => {
// //       unwatchStake()
// //       unwatchWithdraw()
// //     }
// //   }, [address])

// //   return { stakeEvents, withdrawEvents, loading, error }
// // }

// import { parseAbiItem } from 'viem'
// // import { publicClient } from '../config/publicClient'
// import { useEffect, useState } from 'react'
// import { useAccount, usePublicClient } from 'wagmi'
// import { STAKING_ABI } from '../abi/staking'

// const STAKING_CONTRACT_ADDRESS = import.meta.env
//   .VITE_STAKING_CONTRACT as `0x${string}`

// export function useStakingEvents() {
//   const { address } = useAccount()
//   const [lastStake, setLastStake] = useState<any | null>(null)
//   const [lastWithdraw, setLastWithdraw] = useState<any | null>(null)
//   const [error, setError] = useState<string | null>(null)
//   const publicClient = usePublicClient();

//   useEffect(() => {
//     if (!address) return
//     let unwatchStake: any, unwatchWithdraw: any

//     try {
//       // Watch Staked
//       unwatchStake = publicClient.watchContractEvent({
//         address: STAKING_CONTRACT_ADDRESS,
//         abi: [parseAbiItem('event Staked(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)')],
//         fromBlock: latestBlock - 10000n,
//         toBlock: 'latest',
//         onLogs: (logs) => {
//           const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
//           if (filtered.length) setLastStake(filtered[filtered.length - 1])
//         },
//       })

//       // Watch Withdrawn
//       unwatchWithdraw = publicClient.watchContractEvent({
//         address: STAKING_CONTRACT_ADDRESS,
//         abi: [parseAbiItem('event Withdrawn(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)')],
//         fromBlock: latestBlock - 10000n,
//         toBlock: 'latest',
//         onLogs: (logs) => {
//           const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
//           if (filtered.length) setLastWithdraw(filtered[filtered.length - 1])
//         },
//       })

//       return () => {
//         unwatchStake?.()
//         unwatchWithdraw?.()
//       }
//     } catch (err: any) {
//       setError(err.message || 'Failed to watch events')
//     }
//   }, [address])

//   return { lastStake, lastWithdraw, error }
// }


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
      // Watch Staked
      unwatchStake = publicClient.watchEvent({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event Staked(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate)'
        ),
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
          if (filtered.length) setLastStake(filtered[filtered.length - 1])
        },
      })

      // Watch Withdrawn
      unwatchWithdraw = publicClient.watchEvent({
        address: STAKING_CONTRACT_ADDRESS,
        event: parseAbiItem(
          'event Withdrawn(address user,uint256 amount,uint256 timestamp,uint256 newTotalStaked,uint256 currentRewardRate,uint256 rewardsAccrued)'
        ),
        onLogs: (logs) => {
          const filtered = logs.filter(log => log.args.user.toLowerCase() === address.toLowerCase())
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

  return { lastStake, lastWithdraw, error }
}

