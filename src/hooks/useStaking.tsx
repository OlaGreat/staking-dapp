// import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
// import { parseEther, formatEther } from 'viem'
// import { useToast } from '@/hooks/use-toast'
// import { STAKING_ABI } from '../config/Abi'
// import { erc20Abi } from 'viem'

// const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT
// const ERC20_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_TOKEN

// export function useStaking() {
//   const { address, isConnected } = useAccount()
//   const { toast } = useToast()
//   const { writeContract, isPending } = useWriteContract()
//   const { isLoading: isConfirming } = useWaitForTransactionReceipt()

//   const { data: userDetailsRaw, refetch: refetchUserStake } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_ABI,
//     functionName: 'getUserDetails',
//     args: address ? [address] : undefined,
//     query: { enabled: !!address }
//   })
//   const userDetails = {
//     stakedAmount: userDetailsRaw && userDetailsRaw.stakedAmount !== undefined ? formatEther(userDetailsRaw.stakedAmount) : "0",
//     lastStakeTimestamp: userDetailsRaw && userDetailsRaw.lastStakeTimestamp !== undefined ? Number(userDetailsRaw.lastStakeTimestamp) : 0,
//     pendingRewards: userDetailsRaw && userDetailsRaw.pendingRewards !== undefined ? formatEther(userDetailsRaw.pendingRewards) : "0",
//     timeUntilUnlock: userDetailsRaw && userDetailsRaw.timeUntilUnlock !== undefined ? Number(userDetailsRaw.timeUntilUnlock) : 0,
//     canWithdraw: userDetailsRaw && userDetailsRaw.canWithdraw !== undefined ? Boolean(userDetailsRaw.canWithdraw) : false,
//   }
//   console.log("userDetails =============", userDetails)

//   const { data: pendingRewards, refetch: refetchRewards } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_ABI,
//     functionName: 'getPendingRewards',
//     args: address ? [address] : undefined,
//     query: { enabled: !!address }
//   })

//   const { data: totalStaked, refetch: refetchTotalStaked } = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_ABI,
//     functionName: 'totalStaked'
//   })

//    const { data: apr, refetch: refetchCurrentRewardRate} = useReadContract({
//     address: STAKING_CONTRACT_ADDRESS,
//     abi: STAKING_ABI,
//     functionName: 'currentRewardRate'
//   })

//   // const { data: rewardRate, refetch: refetchRewardRate } = useReadContract({
//   //   address: STAKING_CONTRACT_ADDRESS,
//   //   abi: STAKING_ABI,
//   //   functionName: 'currentRewardRate'
//   // })

//   const { data: tokenBalance, refetch: refetchBalance } = useReadContract({
//     address: ERC20_CONTRACT_ADDRESS,
//     abi: erc20Abi,
//     functionName: 'balanceOf',
//     args: address ? [address] : undefined,
//     query: { enabled: !!address }
//   })

//   const { data: allowance, refetch: refetchAllowance } = useReadContract({
//     address: ERC20_CONTRACT_ADDRESS,
//     abi: erc20Abi,
//     functionName: 'allowance',
//     args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
//     query: { enabled: !!address }
//   })

//   const approveTokens = async (amount: string) => {
//     if (!isConnected || !address) {
//       toast({ title: "Wallet not connected", variant: "destructive" })
//       return false
//     }
//     try {
//       const amountInWei = parseEther(amount)
//       await writeContract({
//         address: ERC20_CONTRACT_ADDRESS,
//         abi: erc20Abi,
//         functionName: 'approve',
//         args: [STAKING_CONTRACT_ADDRESS, amountInWei],
//       })
//       toast({ title: "Token approval submitted" })
//       refetchAllowance()
//       return true
//     } catch (error: any) {
//       toast({ 
//         title: "Approval failed", 
//         description: error?.message || "Unknown error",
//         variant: "destructive" 
//       })
//       return false
//     }
//   }

//   const checkBalanceAndAllowance = async (amount: string) => {
//     const amountInWei = parseEther(amount)
//     const balance = tokenBalance || BigInt(0)
//     const currentAllowance = allowance || BigInt(0)
//     if (balance < amountInWei) {
//       toast({ title: "Insufficient token balance", variant: "destructive" })
//       return false
//     }
//     if (currentAllowance < amountInWei) {
//       const approvalStatus = await approveTokens(amount)
//       return approvalStatus
//     }
//     return true
//   }

//   const stake = async (amount: string) => {
//     if (!isConnected || !address) {
//       toast({ title: "Wallet not connected", variant: "destructive" })
//       return
//     }
//     if (!(await checkBalanceAndAllowance(amount))) {
//       return
//     }
//     try {
//       await writeContract({
//         address: STAKING_CONTRACT_ADDRESS,
//         abi: STAKING_ABI,
//         functionName: 'stake',
//         args: [parseEther(amount)],
//       })
//       toast({ title: "Staking transaction submitted" })
//       console.log("=============== Staking transaction submitted")
//       refetchAll()
//       console.log("=============== refetchAll called")
//     } catch (error: any) {
//       toast({ 
//         title: "Staking failed", 
//         description: error?.message || "Unknown error",
//         variant: "destructive" 
//       })
//     }
//   }

//   const withdraw = async (amount: string) => { 
//     if (!isConnected || !address) {
//       toast({ title: "Wallet not connected", variant: "destructive" })
//       return
//     }
//     try {
//     const tx = await writeContract({
//         address: STAKING_CONTRACT_ADDRESS,
//         abi: STAKING_ABI,
//         functionName: 'withdraw',
//         args: [parseEther(amount)],
//       })
//       console.log("tx =============", tx)
//       toast({ title: "Withdrawal transaction submitted" })
//       refetchAll()
//     } catch (error: any) {
//       toast({ 
//         title: "Withdrawal failed", 
//         description: error?.message || "Unknown error",
//         variant: "destructive" 
//       })
//     }
//   }

//   const claimRewards = async () => {
//     if (!isConnected || !address) {
//       toast({ title: "Wallet not connected", variant: "destructive" })
//       return
//     }
//     try {
//       await writeContract({
//         address: STAKING_CONTRACT_ADDRESS,
//         abi: STAKING_ABI,
//         functionName: 'claimRewards',
//       })
//       toast({ title: "Claim rewards transaction submitted" })
//       refetchAll()
//     } catch (error: any) {
//       toast({ 
//         title: "Claim failed", 
//         description: error?.message || "Unknown error",
//         variant: "destructive" 
//       })
//     }
//   }

//   const emergencyWithdraw = async () => {
//     if (!isConnected || !address) {
//       toast({ title: "Wallet not connected", variant: "destructive" })
//       return
//     }
//     try {
//       await writeContract({
//         address: STAKING_CONTRACT_ADDRESS,
//         abi: STAKING_ABI,
//         functionName: 'emergencyWithdraw',
//       })
//       toast({ title: "Emergency withdrawal submitted" })
//       console.log("======================Emergency withdrawal submitted")
//       refetchAll()
//       console.log("======================refetchAll called")
//     } catch (error: any) {
//       toast({ 
//         title: "Emergency withdrawal failed", 
//         description: error?.message || "Unknown error",
//         variant: "destructive" 
//       })
//     }
//   }

//   const refetchAll = () => {
//     refetchUserStake()
//     refetchRewards()
//     refetchBalance()
//     refetchAllowance()
//     refetchTotalStaked && refetchTotalStaked()
//     refetchCurrentRewardRate()
//   }

//   return {
//     userDetails,
//     pendingRewards: pendingRewards ? formatEther(pendingRewards) : "0",
//     totalStaked: totalStaked ? formatEther(totalStaked) : "0",
//     tokenBalance: tokenBalance ? formatEther(tokenBalance) : "0",
//     allowance: allowance ? formatEther(allowance) : "0",
//     stake,
//     apr,
//     withdraw,
//     claimRewards,
//     emergencyWithdraw,
//     approveTokens,
//     isTransacting: isPending || isConfirming,
//     isConnected,
//     address,
//     refetch: refetchAll,
//     needsApproval: (amount: string) => {
//       const currentAllowance = allowance || BigInt(0)
//       return currentAllowance < parseEther(amount)
//     }
//   }
// }

import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWriteContract, useReadContract } from 'wagmi'
import { useToast } from '@/components/ui/use-toast'
import { STAKING_ABI } from '../config/Abi'
import { erc20Abi } from 'viem'
import { parseEther, formatEther, maxUint256 } from 'viem'


const STAKING_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_CONTRACT
const ERC20_CONTRACT_ADDRESS = import.meta.env.VITE_STAKING_TOKEN

export function useStaking() {
  const { toast } = useToast()
  const { address, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const [userDetails, setUserDetails] = useState<any>({})
  const [pendingRewards, setPendingRewards] = useState('0')
  const [totalStaked, setTotalStaked] = useState('0')
  const [apr, setApr] = useState('0')
  const [isTransacting, setIsTransacting] = useState(false)
  const [tokenBalance, setTokenBalance] = useState<bigint>(0n)
  const [allowance, setAllowance] = useState<bigint>(1n)


  const { data: contractUserDetails } = useReadContract({
    abi: STAKING_ABI,
    address: STAKING_CONTRACT_ADDRESS,
    functionName: 'getUserDetails',
    args: address ? [address] : undefined,
    watch: true,
  })

  const { data: contractPendingRewards } = useReadContract({
    abi: STAKING_ABI,
    address: STAKING_CONTRACT_ADDRESS,
    functionName: 'getPendingRewards',
    args: address ? [address] : undefined,
    watch: true,
  })

  const { data: contractTotalStaked } = useReadContract({
    abi: STAKING_ABI,
    address: STAKING_CONTRACT_ADDRESS,
    functionName: 'totalStaked',
    watch: true,
  })

  const { data: contractApr } = useReadContract({
    abi: STAKING_ABI,
    address: STAKING_CONTRACT_ADDRESS,
    functionName: 'currentRewardRate',
    watch: true,
  })

  // --- Sync state ---
  useEffect(() => {
    if (contractUserDetails) setUserDetails(contractUserDetails)
      // pendingRewards ? formatEther(pendingRewards) : "0"
    if (contractPendingRewards) setPendingRewards(formatEther(contractPendingRewards))
    if (contractTotalStaked) setTotalStaked(contractTotalStaked.toString())
    if (contractApr) setApr(contractApr.toString())
  }, [contractUserDetails, contractPendingRewards, contractTotalStaked, contractApr])



  //   const approveTokens = async (amount: string) => {
  //   if (!isConnected || !address) {
  //     toast({ title: "Wallet not connected", variant: "destructive" })
  //     return false
  //   }
  //   try {
  //     const amountInWei = parseEther(amount)
  //     await writeContractAsync({
  //       address: ERC20_CONTRACT_ADDRESS,
  //       abi: erc20Abi,
  //       functionName: 'approve',
  //       args: [STAKING_CONTRACT_ADDRESS, amountInWei],
  //     })
  //     toast({ title: "Token approval submitted" })
  //     return true
  //   } catch (error: any) {
  //     toast({ 
  //       title: "Approval failed", 
  //       description: error?.message || "Unknown error",
  //       variant: "destructive" 
  //     })
  //     return false
  //   }
  // }


const approveTokens = async () => {
  if (!isConnected || !address) {
    toast({ title: "Wallet not connected", variant: "destructive" })
    return false
  }

  try {
    await writeContractAsync({
      address: ERC20_CONTRACT_ADDRESS,
      abi: erc20Abi,
      functionName: 'approve',
      args: [STAKING_CONTRACT_ADDRESS, maxUint256], // approve max
    })

    toast({ title: "Unlimited token approval submitted" })
    return true
  } catch (error: any) {
    toast({ 
      title: "Approval failed", 
      description: error?.message || "Unknown error",
      variant: "destructive" 
    })
    return false
  }
}

  const { data: tokenBalanceRaw, isLoading: isBalanceLoading } = useReadContract({
    address: ERC20_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },

  })

  console.log("tokenbalance ======", tokenBalanceRaw)
  useEffect(() => {
    console.log("tokenbalance ====== 2222", tokenBalanceRaw)

    if (tokenBalanceRaw !== undefined) {
      setTokenBalance(tokenBalanceRaw)
    }  
  }, [tokenBalanceRaw])




  const { data: contractAllowance } = useReadContract({
    address: ERC20_CONTRACT_ADDRESS,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address ? [address, STAKING_CONTRACT_ADDRESS] : undefined,
    query: { enabled: !!address },

  })
   useEffect(() => {
    console.log("allowance ====== 2222", contractAllowance)

    if (contractAllowance !== undefined) {
      setAllowance(contractAllowance)
    }
  }, [contractAllowance])



const checkBalanceAndAllowance = async (amount: string) => {
  const amountInWei = parseEther(amount)

  if (tokenBalanceRaw < amountInWei) {
    console.log("tokenbalance========", tokenBalance)
    toast({ title: "Insufficient token balance", variant: "destructive" })
    return false
  }
  return true
}

  const stake = useCallback(async (amount: string) => {
  if (!(await checkBalanceAndAllowance(amount))) {
        console.log("tokenbalance========", tokenBalance)
    toast({ title: 'Error', description: 'staking failed approve spend token' })
      return
    }

    try {
      setIsTransacting(true)
      await writeContractAsync({
        abi: STAKING_ABI,
        address: STAKING_CONTRACT_ADDRESS,
        functionName: 'stake',
        args: [parseEther(amount)],
      })
      toast({ title: 'Success', description: `Staked ${amount} gOV` })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Stake failed' })
    } finally {
      setIsTransacting(false)
    }
  }, [writeContractAsync, toast])

  const withdraw = useCallback(async (amount: string) => {
    try {
      setIsTransacting(true)
      await writeContractAsync({
        abi: STAKING_ABI,
        address: STAKING_CONTRACT_ADDRESS,
        functionName: 'withdraw',
        args: [parseEther(amount)],
      })
      toast({ title: 'Success', description: `Withdrew ${amount} gOV` })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Withdraw failed' })
    } finally {
      setIsTransacting(false)
    }
  }, [writeContractAsync, toast])

  const claimRewards = useCallback(async () => {
    try {
      setIsTransacting(true)
      await writeContractAsync({
        abi: STAKING_ABI,
        address: STAKING_CONTRACT_ADDRESS,
        functionName: 'claimRewards',
      })
      toast({ title: 'Success', description: 'Rewards claimed' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Claim failed' })
    } finally {
      setIsTransacting(false)
    }
  }, [writeContractAsync, toast])

  const emergencyWithdraw = useCallback(async () => {
    try {
      setIsTransacting(true)
      await writeContractAsync({
        abi: STAKING_ABI,
        address: STAKING_CONTRACT_ADDRESS,
        functionName: 'emergencyWithdraw',
      })
      toast({ title: 'Success', description: 'Emergency withdrawal complete' })
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Emergency withdraw failed' })
    } finally {
      setIsTransacting(false)
    }
  }, [writeContractAsync, toast])

  return {
    userDetails,
    pendingRewards,
    totalStaked,
    apr,
    stake,
    withdraw,
    claimRewards,
    emergencyWithdraw,
    isTransacting,
    isConnected,
    approveTokens,
  }
}
