<script setup lang="ts">
import { NCollapseItem, NIcon, NButton, NSpin } from 'naive-ui';
import { computed, ref } from 'vue';
import type { Ref } from 'vue';
import { Wallet as WalletIcon } from '@vicons/ionicons5';
import { Wallet } from 'ethers';

const emits = defineEmits<{
  (
    e: 'getCreatedWallet',
    accountAddress: string,
    accountPrivateKey: string,
    accountGenerationDate: Date
  ): void;
}>();
const publicAddress: Ref<string | null> = ref(null);
const isCreating = ref(false);

const title = computed(() =>
  publicAddress.value && !isCreating.value
    ? `Created wallet ${publicAddress.value}`
    : 'Create new or restore existing wallet'
);

const generateWallet = async () => {
  const wallet = Wallet.createRandom();
  publicAddress.value = wallet.address;
  isCreating.value = true;

  await new Promise(() => {
    setTimeout(() => {
      isCreating.value = false;
    }, 3000);
    emits('getCreatedWallet', wallet.address, wallet.privateKey, new Date());
  });
};
</script>
<template>
  <n-collapse-item name="setup">
    <template #header>
      <n-icon><wallet-icon /></n-icon>&nbsp;
      <h4 class="font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-5 p-1">
      <p>
        In order to buy crypto, one has to have a private key which would hold
        the tokens. Most customer-friendly apps would hold the key for you (and
        therefore would have access to your tokens). Instead of it, here you can
        have full ownership of your funds and not depend on our service to stay
        online.
      </p>
      <div class="flex w-full gap-x-2">
        <n-button
          :loading="isCreating"
          :disabled="!!publicAddress"
          @click="generateWallet"
        >
          Create new wallet
        </n-button>
        <n-button disabled>Use existing private key</n-button>
        <n-button disabled>Restore from preseved</n-button>
      </div>
      <div class="flex">
        <span>Wallet address:&nbsp;</span>
        <span v-if="isCreating" class="text-neutral-400">
          Creating new wallet...
        </span>
        <span v-else-if="!publicAddress" class="text-neutral-400">Not yet created</span>
        <span v-else>{{ publicAddress }}</span>
      </div>
    </div>
  </n-collapse-item>
</template>
