<script setup lang="ts">
import { NModal } from 'naive-ui';
defineProps<{ show: boolean; accountAddress: string }>();
</script>
<template>
  <n-modal
    style="width: 600px"
    :show="show"
    preset="card"
    :mask-closable="false"
  >
    <div class="w-full">
      <iframe
        width="550"
        height="800"
        :src="`https://onramp-sandbox.gatefi.com/?partnerAccountId=1211c900-ebfe-4017-aaab-d0ad80896249&wallet=${accountAddress}&cryptoCurrency=ETH&walletLock=true`"
        title="Unlimit"
      ></iframe>
    </div>
  </n-modal>
</template>
