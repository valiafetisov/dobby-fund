<script setup lang="ts">
import { NCollapseItem, NButton } from 'naive-ui'
import { ref } from 'vue'
import { add } from 'date-fns'
import { JsonRpcProvider, Wallet, Contract } from 'ethers'
import { useMessage } from 'naive-ui'

const message = useMessage()
const props = defineProps<{
  accountPrivateKey?: string
  accountBalance?: bigint
}>()
const emits = defineEmits<{
  (e: 'locked', amount: bigint): void
}>()

const config = useRuntimeConfig()
const dateInTheFuture = add(new Date(), { years: 1 })
const selectedDate = ref(dateInTheFuture.valueOf())
const isLocking = ref(false)

const lockFunds = async () => {
  if (!props.accountPrivateKey) {
    return
  }
  try {
    isLocking.value = true
    const deadlineUnixTimestamp = Math.floor(selectedDate.value / 1000)
    const provider = new JsonRpcProvider(config.public.rpcUrl)
    const signer = new Wallet(props.accountPrivateKey, provider)
    const protocol = new Contract(
      config.public.protocolAddress,
      [
        'function depositEth(address receiver, uint40 claimableDate) external payable returns (uint256)',
        'function balanceOf(address account) external view returns (uint256)',
      ],
      signer
    )
    const ethBalance = await provider.getBalance(signer.address)
    const approximateTransactionCost = 433948006075272n
    const transaction = await protocol.depositEth(signer.address, deadlineUnixTimestamp, { value: ethBalance - approximateTransactionCost })
    await transaction.wait(3)
    const balance = await protocol.balanceOf(signer.address)
    emits('locked', balance)
  } catch (error: any) {
    message.error(`Locking of funds failed due to "${error.message}""`)
  } finally {
    isLocking.value = false
  }
}
</script>

<template>
  <n-collapse-item name="lock">
    <template #header>
      <img src="~/assets/icons/head-lock.svg" class="w-6 h-6 mt-1" />
      <h4 class="ml-2 font-semibold">Lock funds</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <p>
        You are about to exchange deposited funds into one of the yield-bearing tokens. By locking them into a smart contract you ensure
        that they can't be spent before the specified date. Please note that if funds are not reclaimed after a period of 10 years from the
        unlock date, they will be donated to a public goods organisation.
      </p>
      <div class="flex flex-col w-full gap-5">
        <n-date-picker v-model:value="selectedDate" :disabled="isLocking" type="date" class="w-full" />
        <n-button type="info" :loading="isLocking" @click="lockFunds" :disabled="!accountPrivateKey || accountBalance === 0n">
          Lock funds
        </n-button>
      </div>
    </div>
  </n-collapse-item>
</template>
