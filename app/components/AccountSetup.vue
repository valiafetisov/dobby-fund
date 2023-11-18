<script setup lang="ts">
import { NCollapse, NCollapseItem, NIcon, NButton, NSpin } from 'naive-ui'
import { computed, ref } from 'vue'
import type {Ref} from 'vue'
import { Wallet as WalletIcon } from '@vicons/ionicons5'
import { Wallet } from 'ethers'

const emits = defineEmits<{(e: 'getCreatedWallet', accountAddress: string, accountPrivateKey: string, accountGenerationDate: Date): void}>()
const publicAddress: Ref<string | null> = ref(null)
const isCreating = ref(false)

const title = computed(() => publicAddress.value && !isCreating.value
? `Created wallet ${publicAddress.value}`
: 'Create new or restore existing wallet')

const generateWallet = async () => {
    const wallet = Wallet.createRandom()
    publicAddress.value = wallet.address
    isCreating.value = true
    await setTimeout(() => {
        isCreating.value = false
    }, 3000)
    emits('getCreatedWallet', wallet.address, wallet.privateKey, new Date())
}
</script>
<template>
    <n-collapse>
        <n-collapse-item  name="1">
            <template #header>
                <n-icon><wallet-icon /></n-icon>&nbsp;
                <h4 class="font-semibold">{{ title }}</h4>
            </template>   
            <div class="flex flex-col gap-y-2">
                <p>
                    In order to buy crypto, one has to have a private key which would hold the tokens. 
                    Most customer-friendly apps would hold the key for you (and therefore would have access to your tokens).
                    Instead of it, here you can have full ownership of your funds and not depend on our service to stay online.
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
                <div class="flex gap-2"><span>Wallet address: </span>
                    <div v-if="isCreating"><n-spin size="small" class="mr-2" />Creating new wallet</div>
                    <span v-else>{{ publicAddress ?? 'Not yet created' }}</span>
                </div>
            </div>
        </n-collapse-item>
    </n-collapse>
</template>