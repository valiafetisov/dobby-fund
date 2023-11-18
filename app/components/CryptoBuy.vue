<script setup lang="ts">
import { NCollapseItem, NIcon, NButton, NSelect } from 'naive-ui';
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { Card as CardIcon } from '@vicons/ionicons5';
import { format } from 'date-fns';
import { GateFiSDK } from '@gatefi/js-sdk';

const props = defineProps<{
  accountAddress: string | undefined;
}>();

const emits = defineEmits<{
  (
    e: 'getCreatedWallet',
    accountAddress: string,
    accountPrivateKey: string,
    accountGenerationDate: Date
  ): void;
}>();

const balanceDepositedAt = ref(new Date());
const selectedToken = ref('sDAI');
const options = [
  { label: 'Savings DAI (sDAI) - a yield bearing crypto asset', value: 'sDAI' },
];

const currentBalance = ref(0);

const title = computed(() => 'Fund Wallet');

let overlayInstance: any;
const modalOpen = () => {
  if (overlayInstance) {
    overlayInstance.show();
    return;
  }
  overlayInstance = new GateFiSDK({
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
  });
};
</script>
<template>
  <n-collapse-item name="1">
    <template #header>
      <n-icon><card-icon /></n-icon>
      <h4 class="ml-2 font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <div id="placeToAttach">
        Fund the wallet by buying the selected crypto asset with your Euro
        savings.
      </div>
      <div>
        <n-select v-model:value="selectedToken" :options="options" />
      </div>
      <div class="flex w-full gap-5">
        <n-button class="flex-1" type="info" @click="modalOpen" :disabled="!accountAddress">
          Buy {{ selectedToken }} with a credit card
        </n-button>
        <n-button class="flex-1" secondary disabled>Transfer {{ selectedToken }} from existing wallet</n-button>
      </div>
      <div>
        <span>Current balance: {{ currentBalance }} {{ selectedToken }}</span>
        <span class="text-gray-400"
          >&nbsp;(last updated at
          {{ format(balanceDepositedAt, 'hh:mm dd.mm.yyyy') }})</span
        >
      </div>
    </div>
  </n-collapse-item>
</template>
