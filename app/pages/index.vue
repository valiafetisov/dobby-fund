<script setup lang="ts">
import type { Ref } from 'vue'

const currentlySelectedStep = ref('setup')
const accountPrivateKey = ref('')
const accountAddress = ref('')
const accountGenerationDate: Ref<Date | null> = ref(null)
const wasAccountArchived = ref(false)

const getCreatedWallet = (address: string, privateKey: string, generationDate: Date) => {
  accountAddress.value = address
  accountPrivateKey.value = privateKey
  accountGenerationDate.value = generationDate
  currentlySelectedStep.value = 'archive'
}

const updateConfirmed = (isConfirmed: boolean) => {
  currentlySelectedStep.value = 'buy'
  wasAccountArchived.value = isConfirmed
}
</script>

<template>
  <div class="flex items-center justify-center">
    <div class="w-full max-w-screen-sm mt-32 border rounded border-neutral-300 p-4 bg-white">
      <n-collapse arrow-placement="right" display-directive="show" :expanded-names="currentlySelectedStep" accordion>
        <AccountSetup @get-created-wallet="getCreatedWallet" @click="currentlySelectedStep = 'setup'" />
        <AccountArchival
          :accountGenerationDate="accountGenerationDate"
          :accountPrivateKey="accountPrivateKey"
          @updateConfirmed="updateConfirmed"
          @click="currentlySelectedStep = 'archive'"
        />
        <CryptoBuy :accountAddress="accountAddress" :disabled="!wasAccountArchived" @click="currentlySelectedStep = 'buy'" />
      </n-collapse>
    </div>
  </div>
</template>
