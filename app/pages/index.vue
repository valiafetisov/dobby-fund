<script setup lang="ts">
import type { Ref } from 'vue'

const accountPrivateKey = ref('')
const accountAddress = ref('')
const accountGenerationDate: Ref<Date | null> = ref(null)

const getCreatedWallet = (address: string, privateKey: string, generationDate: Date) => {
  accountAddress.value = address;
  accountPrivateKey.value = privateKey;
  accountGenerationDate.value = generationDate;
}
const updateConfirmed = () => {
  console.log('updateConfirmed')
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="w-full max-w-screen-sm mt-32 border rounded border-neutral-300 p-4 bg-white">
      <n-collapse arrow-placement="right" display-directive="show" default-expanded-names="setup" accordion>
        <AccountSetup @get-created-wallet="getCreatedWallet" />
        <AccountArchival :accountGenerationDate="accountGenerationDate" :accountPrivateKey="accountPrivateKey" @updateConfirmed="updateConfirmed" />
        <CryptoBuy :accountAddress="accountAddress" />
      </n-collapse>
    </div>
  </div>
</template>
