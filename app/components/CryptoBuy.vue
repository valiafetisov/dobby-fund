<script setup lang="ts">
import { NCollapseItem, NIcon, NButton, NSelect } from 'naive-ui';
import { computed, ref } from 'vue';
import { Card as CardIcon } from '@vicons/ionicons5';
import { format } from 'date-fns';

const props = defineProps<{ accountAddress: string }>();

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
const showModal = ref(false);

const title = computed(() => 'Fund Wallet');

const widget = async () => {
  const response = await fetch(
    `https://api-sandbox.gatefi.com/onramp/v1/orders/${orderId}`,
    {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'access-control-allow-headers': 'Accept',
        'api-key': 'eOLFHIEVQmwqJOAwWBOiFsfnNhncHigb',
      },
    }
  );
  const data = await response;
  console.log(data);
  return data.url;
};

const openModal = async () => {
  showModal.value = true;
  await widget();
};
</script>
<template>
  <n-collapse-item name="1">
    <template #header>
      <n-icon><card-icon /></n-icon>&nbsp;
      <h4 class="font-semibold">{{ title }}</h4>
    </template>
    <UnlimitBuyModal
      :show="showModal"
      :accountAddress="accountAddress"
      @close="showModal = false"
    />
    <div class="flex flex-col gap-y-2">
      <div>
        Fund the wallet by buying the selected crypto asset with your Euro
        savings.
      </div>
      <div>
        <span class="font-semibold">Tokens</span>
        <n-select v-model:value="selectedToken" disabled :options="options" />
      </div>
      <div class="flex w-full gap-x-2">
        <n-button ref="overlay-button" type="primary" @click="openModal"
          >Buy {{ selectedToken }}</n-button
        >
        <n-button disabled>Send {{ selectedToken }}</n-button>
      </div>

      <div class="flex gap-2">
        <span>Current balance: {{ currentBalance }} {{ selectedToken }}</span>
        <span class="text-gray-500"
          >(last updated at
          {{ format(balanceDepositedAt, 'hh:mm dd.mm.yyyy') }})</span
        >
      </div>
    </div>
  </n-collapse-item>
</template>
