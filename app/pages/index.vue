<script setup lang="ts">
import type { Ref } from 'vue'
import { JsonRpcProvider } from 'ethers'

const config = useRuntimeConfig()
const currentlySelectedStep = ref('setup')
const accountPrivateKey = ref('')
const accountAddress = ref('')
const accountGenerationDate: Ref<Date | undefined> = ref()
const wasAccountArchived = ref(false)
const accountBalance = ref(0n)
const accountBalanceLastCheckedAt: Ref<Date | undefined> = ref()
const provider = new JsonRpcProvider(config.public.rpcUrl)

const checkBalance = async () => {
  if (!accountAddress.value) {
    return
  }
  try {
    accountBalance.value = await provider.getBalance(accountAddress.value);
    accountBalanceLastCheckedAt.value = new Date()
  } catch {}
}
checkBalance()
setInterval(checkBalance, 5000)

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
        <AccountSetup
          @get-created-wallet="getCreatedWallet"
          @click="currentlySelectedStep = 'setup'"
        />
        <AccountArchival
          :accountGenerationDate="accountGenerationDate"
          :accountPrivateKey="accountPrivateKey"
          @updateConfirmed="updateConfirmed"
          @click="currentlySelectedStep = 'archive'"
        />
        <CryptoBuy
          :accountAddress="accountAddress"
          :accountBalanceLastCheckedAt="accountBalanceLastCheckedAt"
          :accountBalance="accountBalance"
          :disabled="!wasAccountArchived"
          @click="currentlySelectedStep = 'buy'"
          @funded="currentlySelectedStep = 'lock'"
        />
        <LockingProtocol
          :accountPrivateKey="accountPrivateKey"
          :accountBalance="accountBalance"
          @click="currentlySelectedStep = 'lock'"
          @locked="currentlySelectedStep = 'setup'"
        />
      </n-collapse>
    </div>
  </div>
</template>
