<script setup lang="ts">
import type { Ref } from 'vue'

const accountPrivateKey = ref('')
const accountAddress = ref('')
const accountGenerationDate: Ref<Date | null> = ref(null)
const collapseToExpand = ref('setup')

const getCreatedWallet = (address: string, privateKey: string, generationDate: Date) => {
  accountAddress.value = address
  accountPrivateKey.value = privateKey
  accountGenerationDate.value = generationDate
  collapseToExpand.value = 'archive'
}

const updateConfirmed = () => {
  collapseToExpand.value = 'buy'
  console.log('updateConfirmed')
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="w-full max-w-screen-sm mt-32 border rounded border-neutral-300 p-4 bg-white">
      <n-collapse arrow-placement="right" display-directive="show" :expanded-names="collapseToExpand" accordion>
        <AccountSetup @get-created-wallet="getCreatedWallet" @click="collapseToExpand = 'setup'" />
        <AccountArchival
          :accountGenerationDate="accountGenerationDate"
          :accountPrivateKey="accountPrivateKey"
          :accountAddress="accountAddress"
          @updateConfirmed="updateConfirmed"
          @click="collapseToExpand = 'archive'"
        />
        <CryptoBuy :accountAddress="accountAddress" @click="collapseToExpand = 'buy'" />
      </n-collapse>
    </div>
  </div>
</template>
