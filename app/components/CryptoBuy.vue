<script setup lang="ts">
import { NCollapseItem, NIcon, NButton } from 'naive-ui'
import { computed } from 'vue'
import { Card as CardIcon } from '@vicons/ionicons5'
import { format } from 'date-fns'
import { GateFiSDK } from '@gatefi/js-sdk'

const props = defineProps<{
  accountAddress: string | undefined
  currentBalance: number | undefined
  currentBalanceLastCheckedAt: Date | undefined
}>()

const emits = defineEmits<{
  (e: 'getCreatedWallet', accountAddress: string, accountPrivateKey: string, accountGenerationDate: Date): void
}>()

const title = computed(() => (props.currentBalance ? `Wallet funded with ${props.currentBalance.toFixed(2)}` : 'Fund Wallet'))

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
      <n-icon><card-icon /></n-icon>
      <h4 class="ml-2 font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <div id="placeToAttach">Fund created wallet by exchanging EUR into volatile cryptocurrency called ETH.</div>
      <div class="flex w-full gap-5">
        <n-button class="flex-1" type="info" @click="modalOpen" :disabled="!accountAddress"> Buy ETH with a credit card </n-button>
        <n-button class="flex-1" secondary disabled>Transfer ETH from your existing wallet</n-button>
      </div>
      <div>
        <span
          >Current balance:
          <span v-if="accountAddress && currentBalance !== undefined">{{ currentBalance.toFixed(2) }} ETH</span>
          <span v-else class="text-neutral-400">Unknown</span>
        </span>
        <span class="text-gray-400" v-if="currentBalanceLastCheckedAt"
          >&nbsp;(last updated at {{ format(currentBalanceLastCheckedAt, 'hh:mm dd.mm.yyyy') }})</span
        >
      </div>
    </div>
  </n-collapse-item>
</template>
