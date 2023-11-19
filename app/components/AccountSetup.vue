<script setup lang="ts">
import { NCollapseItem, NButton } from 'naive-ui'
import { computed, ref } from 'vue'
import type { Ref } from 'vue'
import { Wallet } from 'ethers'

const emits = defineEmits<{
  (e: 'getCreatedWallet', accountAddress: string, accountPrivateKey: string, accountGenerationDate: Date): void
}>()
const publicAddress: Ref<string | null> = ref(null)
const isCreating = ref(false)

const title = computed(() => {
  if (isCreating.value) {
    return 'Creating new account...'
  }
  if (publicAddress.value) {
    return `Created account ${publicAddress.value}`
  }
  return 'Create new or restore existing account'
})

const generateWallet = async () => {
  const wallet = Wallet.createRandom()
  publicAddress.value = wallet.address
  isCreating.value = true
  await new Promise(resolve => setTimeout(resolve, 700))
  isCreating.value = false
  emits('getCreatedWallet', wallet.address, wallet.privateKey, new Date())
}
</script>
<template>
  <n-collapse-item name="setup">
    <template #header>
      <img src="~/assets/icons/head-wallet.svg" class="w-6 h-6 mt-1" />
      <h4 class="ml-2 font-semibold">{{ title }}</h4>
    </template>
    <div class="flex flex-col gap-y-5 py-1">
      <p>
        In order to buy crypto, one has to have a private key which would hold the tokens. Most customer-friendly apps would hold the key
        for you (and therefore would have access to your tokens). Instead of it, here you can have full ownership of your funds and not
        depend on our service to stay online.
      </p>
      <div class="flex w-full gap-x-5">
        <n-button class="flex-1" type="info" :loading="isCreating" :disabled="!!publicAddress" @click="generateWallet">
          Create new account
        </n-button>
        <n-button class="flex-1" secondary disabled>Use existing private key</n-button>
        <n-button class="flex-1" secondary disabled>Restore from preseved</n-button>
      </div>
      <div class="flex">
        <span>Account address:&nbsp;</span>
        <span v-if="isCreating" class="text-neutral-400"> Creating new account... </span>
        <span v-else-if="!publicAddress" class="text-neutral-400">Not yet created</span>
        <span v-else>{{ publicAddress }}</span>
      </div>
    </div>
  </n-collapse-item>
</template>
