
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
