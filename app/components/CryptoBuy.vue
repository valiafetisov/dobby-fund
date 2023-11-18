<script setup lang="ts">
import { NCollapseItem, NIcon, NButton } from 'naive-ui'
import { computed } from 'vue'
import { Card as CardIcon } from '@vicons/ionicons5'
import { format } from 'date-fns'
import { GateFiSDK } from '@gatefi/js-sdk'

const props = defineProps<{
  accountAddress?: string;
  disabled: boolean;
  accountBalance?: bigint;
  accountBalanceLastCheckedAt?: Date;
}>()

const emits = defineEmits<{
  (e: 'getCreatedWallet', accountAddress: string, accountPrivateKey: string, accountGenerationDate: Date): void
}>()

watch(
  () => props.accountBalance,
  (newAccountBalance, oldAccountBalance) => {
    if (newAccountBalance && newAccountBalance !== oldAccountBalance && newAccountBalance > 0n) {
      if ((window as any).overlayInstance) {
        ;(window as any).overlayInstance.destroy()
      }
    }
  }
)

const title = computed(() => (props.accountBalance ? `Wallet funded with ${props.accountBalance.toFixed(2)}` : 'Fund Wallet'))

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
        <n-button class="flex-1" type="info" @click="modalOpen" :disabled="!accountAddress || disabled"> Buy ETH with a credit card </n-button>
        <n-button class="flex-1" secondary disabled>Transfer ETH from your existing wallet</n-button>
      </div>
      <div>
        <span
          >Current balance:
          <span v-if="accountAddress">{{ (accountBalance ?? 0) }} ETH</span>
          <span v-else class="text-neutral-400">Unknown</span>
        </span>
        <span class="text-gray-400" v-if="accountBalanceLastCheckedAt"
          >&nbsp;(last updated at {{ format(accountBalanceLastCheckedAt, 'HH:mm dd.MM.yyyy') }})</span
        >
      </div>
    </div>
  </n-collapse-item>
</template>
