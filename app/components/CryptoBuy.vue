<script setup lang="ts">
import { NCollapseItem, NButton } from 'naive-ui'
import { computed } from 'vue'
import { format } from 'date-fns'
import { formatEther } from 'ethers'
import { GateFiSDK } from '@gatefi/js-sdk'

const props = defineProps<{
  accountAddress?: string
  disabled: boolean
  accountBalance?: bigint
  accountBalanceLastCheckedAt?: Date
}>()

const emits = defineEmits<{
  (e: 'funded'): void
}>()

watch(
  () => props.accountBalance,
  (newAccountBalance, oldAccountBalance) => {
    if (newAccountBalance && newAccountBalance !== oldAccountBalance && newAccountBalance > 0n) {
      if ((window as any).overlayInstance) {
        ;(window as any).overlayInstance.destroy()
      }
      emits('funded')
    }
  }
)

const title = computed(() => (props.accountBalance ? `Account funded with ${formatEther(props.accountBalance ?? 0)}` : 'Fund account'))

const modalOpen = () => {
  if ((window as any).overlayInstance) {
    ;(window as any).overlayInstance.show()
    return
  }
  ;(window as any).overlayInstance = new GateFiSDK({
    merchantId: '1211c900-ebfe-4017-aaab-d0ad80896249',
    displayMode: 'overlay',
    nodeSelector: '#placeToAttach',
    walletAddress: props.accountAddress,
    defaultCrypto: 'ETH',
    availableCrypto: ['ETH'],
    type: 'light',
    hideAsset: true,
    walletLock: true,
    cryptoCurrencyLock: true,
    hideThemeSwitcher: true,
    isSandbox: true,
  })
}
</script>
<template>
  <n-collapse-item name="buy">
    <template #header>
      <img src="~/assets/icons/head-goldcoin.svg" class="w-6 h-6 mt-1" />
      <h4 class="ml-2 font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <div id="placeToAttach">Fund created account by exchanging EUR into volatile cryptocurrency called ETH.</div>
      <div class="flex w-full gap-5">
        <n-button class="flex-1" type="info" @click="modalOpen" :disabled="!accountAddress || disabled">
          Buy ETH with a credit card
        </n-button>
        <n-button class="flex-1" secondary disabled>Transfer ETH from your existing wallet</n-button>
      </div>
      <div>
        <span
          >Current balance:
          <span v-if="accountAddress">{{ formatEther(accountBalance ?? 0) }} ETH</span>
          <span v-else class="text-neutral-400">Unknown</span>
        </span>
        <span class="text-gray-400" v-if="accountBalanceLastCheckedAt"
          >&nbsp;(last updated at {{ format(accountBalanceLastCheckedAt, 'HH:mm dd.MM.yyyy') }})</span
        >
      </div>
    </div>
  </n-collapse-item>
</template>
